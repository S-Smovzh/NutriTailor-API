import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { DietPlan, MealCategory } from '../../enums';
import { Product } from '../../schemas';

const PROMPT_ANY = (mealCategory: MealCategory, dietPlan: DietPlan) =>
  `Give me a receipt of a ${mealCategory} that will help while ${dietPlan} with any ingredients.`;

const PROMPT_WITH_INGREDIENTS = (mealCategory: MealCategory, dietPlan: DietPlan, productsString: string) =>
  `Give me a receipt of a ${mealCategory} meal that will help while ${dietPlan} with any ingredients. But always include the following ingredients: ${productsString}.`;

// "stepByStepGuide": string; - write guide as a plain string, if a the next sentence starts a new paragraph add "/p" before it, if starts a new line - add "/n"
const PROMPT_RESPONSE_DESCRIPTION = `


IMPORTANT! Provide the response ONLY as a JSON object with such fields:
"name": string; - meal name
"category": 'breakfast' | 'lunch' | 'dinner'; - meal category
"estimatedCookingTimeMinutes"?: number (use only integers);
"complexity"?: string;  
"images"?: string[];
"videos"?: string[];
"stepByStepGuide": string; - write guide how to cook
"ingredients": { "name": string; "measurement": 'grams' | 'milliliters' | 'units' | 'cloves' | 'cups' | 'scoops' | 'tablespoons' | 'teaspoons' ; "amount": number (use only integers) }[];
"nutritionScore": string; - include calories, protein, carbs and fats
"linkToOriginal": string;
"tags"?: string[]
`;

@Injectable()
export class AIService {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  public async getRecipeFromAI(category: MealCategory, dietPlan: DietPlan, products: Product[] = []): Promise<any> {
    const configuration = new Configuration({
      apiKey: this.configService.get('openAiKey'),
    });
    const openai = new OpenAIApi(configuration);
    let PROMPT: string;

    if (!configuration.apiKey) {
      return {
        error: {
          message: 'OpenAI API key not configured, please follow instructions in README.md',
        },
      };
    }

    if (products.length) {
      PROMPT = `${PROMPT_WITH_INGREDIENTS(
        category,
        dietPlan,
        products.map(({ amount, measurement, name }) => `${amount} ${measurement} of ${name}`).join(' and '),
      )}`;
    } else {
      PROMPT = `${PROMPT_ANY(category, dietPlan)}`;
    }

    try {
      const completion = await openai.createCompletion({
        model: 'text-davinci-002',
        prompt: `${PROMPT}${PROMPT_RESPONSE_DESCRIPTION}`,
        temperature: 0.8,
        max_tokens: 3000,
      });

      const objectResponse = completion.data.choices[0].text;

      const arr = objectResponse.split('');
      const startOfObject = arr.indexOf('{');
      arr.reverse();
      const endOfObject = arr.indexOf('}');

      const text = objectResponse.slice(startOfObject, objectResponse.length - endOfObject);

      console.log(PROMPT, 'PROMPT');
      console.log(text, 'text');

      if (text) {
        return JSON.parse(text);
      }

      return null;
    } catch (e) {
      console.error(e);
    }
  }
}
