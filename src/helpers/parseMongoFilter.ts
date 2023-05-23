const parseMongoAggregationFilter = (filterString: string) => {
  try {
    const parsedFilter = JSON.parse(filterString);
    return parsedFilter
      .map(
        ({
          name,
          type,
          place,
          value,
        }: {
          name: string;
          type: 'string' | 'number' | 'array' | 'date' | 'string-to-number';
          value: any;
          place?: 'start' | 'end';
        }) => {
          if (typeof value !== 'number' && (!value || !value.length)) {
            return null;
          }
          switch (type) {
            case 'string':
              return { [name]: { $regex: value, $options: 'i' } };
            case 'number':
              return {
                [name]: { [place === 'start' ? '$gte' : '$lte']: value },
              };
            case 'string-to-number':
              return { [name]: { $eq: +value } };
            case 'array':
              return { [name]: { $in: value } };
            case 'date':
              return {
                [name]: {
                  [place === 'start' ? '$gte' : '$lte']: new Date(value).toISOString(),
                },
              };
            default:
              console.error('Empty filter item. Escaping...');
              break;
          }
        },
      )
      .filter((val) => !!val);
  } catch (err) {
    console.error(`Couldn't parse filter query: ${err}`);
  }
};

export { parseMongoAggregationFilter };
