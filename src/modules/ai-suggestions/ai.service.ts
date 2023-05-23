import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { DietPlan, MealCategory } from '../../enums';
import { Product } from '../../schemas';

const PROMPT_ANY = (mealCategory: MealCategory, dietPlan: DietPlan) =>
  `Give me a receipt of a ${mealCategory} that will help while ${dietPlan} with any ingredients.`;

const PROMPT_WITH_INGREDIENTS = (mealCategory: MealCategory, dietPlan: DietPlan, productsString: string) =>
  `Give me a receipt of a ${mealCategory} meal that will help while ${dietPlan} with the following ingredients: ${productsString}. If not enough ingredients, give receipts that include provided ingredients.`;

const PROMPT_RESPONSE_DESCRIPTION = `


IMPORTANT! Provide the response ONLY as a JSON object with such fields:
name: string; - meal name
category: 'breakfast' | 'lunch' | 'dinner'; - meal category
estimatedCookingTimeMinutes?: number;
complexity?: string;  
images?: string[];
videos?: string[];
stepByStepGuide: string; - write guide as a plain string, if a the next sentence starts a new paragraph add "/p" before it, if starts a new line - add "/n"
ingredients: { name: string; measurement: 'grams' | 'milliliters' | 'units' | 'cloves' | 'cups' | 'scoops' | 'tablespoons' | 'teaspoons' ; amount: number }[];
nutritionScore: string; - include calories, protein, carbs and fats
linkToOriginal: string;
tags?: string[]
`;

@Injectable()
export class AIService {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}
  private readonly openAiUrl = this.configService.get('openAIUrl');
  private readonly openAiApiKey = this.configService.get('openAIKey');

  public async getRecipeFromAI(category: MealCategory, dietPlan: DietPlan, products: Product[] = []): Promise<AxiosResponse> {
    let PROMPT: string;

    if (products.length) {
      PROMPT = `${PROMPT_WITH_INGREDIENTS(
        category,
        dietPlan,
        products.map(({ amount, measurement, name }) => `${amount} ${measurement} of ${name}`).join(' and '),
      )}`;
    } else {
      PROMPT = `${PROMPT_ANY(category, dietPlan)}`;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.openAiApiKey}`,
    };

    const data = {
      prompt: `${PROMPT}${PROMPT_RESPONSE_DESCRIPTION}`,
      max_tokens: 100, // adjust as needed
    };

    const response = await axios.post(this.openAiUrl, data, { headers: headers });

    console.log(response);

    return response;
  }
}
