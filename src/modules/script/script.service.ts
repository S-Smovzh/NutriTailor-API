import { Inject, Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { MealRepository } from '../../repositories';
import { MealCategory } from '../../enums';

const MIN_RECORDS_IN_COLLECTION = 500;

@Injectable()
export class ScriptService {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(MealRepository)
    private readonly mealRepository: MealRepository,
  ) {}

  public async startSeed() {
    const { breakfast, lunch, dinner } = await this.isSeeded();

    switch (true) {
      case breakfast < MIN_RECORDS_IN_COLLECTION: {
        const links = await this.scrapeRecipeLinks(MealCategory.BREAKFAST);
        await Promise.all(links.slice(breakfast).map((link) => this.scrapeRecipe(link, MealCategory.BREAKFAST)));
        return;
      }
      case lunch < MIN_RECORDS_IN_COLLECTION: {
        const links = await this.scrapeRecipeLinks(MealCategory.LUNCH);
        await Promise.all(links.slice(lunch).map((link) => this.scrapeRecipe(link, MealCategory.LUNCH)));
        return;
      }
      case dinner < MIN_RECORDS_IN_COLLECTION: {
        const links = await this.scrapeRecipeLinks(MealCategory.DINNER);
        await Promise.all(links.slice(dinner).map((link) => this.scrapeRecipe(link, MealCategory.DINNER)));
        return;
      }
      default:
        return;
    }
  }

  private async isSeeded(): Promise<{ breakfast: number; lunch: number; dinner: number }> {
    const breakfastDocs = await this.mealRepository.countDocuments({ category: 'breakfast' });
    const lunchDocs = await this.mealRepository.countDocuments({ category: 'lunch' });
    const dinnerDocs = await this.mealRepository.countDocuments({ category: 'dinner' });

    return {
      breakfast: breakfastDocs,
      lunch: lunchDocs,
      dinner: dinnerDocs,
    };
  }

  private async scrapeRecipe(url: string, category: MealCategory) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const content = await page.content();
    const $ = cheerio.load(content);

    const name = $('h1.recipe-name').text().trim();
    const estimatedCookingTimeMinutes = parseInt($('.recipe-time-container .recipe-time p').first().text().trim().split(' ')[0]);
    const complexity = undefined; // The HTML structure doesn't seem to contain a complexity field
    const images = [$('img').attr('src')];
    const videos = []; // The HTML structure doesn't seem to contain a video field
    const stepByStepGuide = $('div.instructions').text().replace(/\n/g, '/n').replace(/\n\n/g, '/p');
    const ingredients = $('ul.list-unstyled li.ingredient')
      .map((i, el) => $(el).text().trim())
      .get();
    const nutritionScore = parseInt($('.nutrition-details .nutrition-value').first().text().trim());
    const linkToOriginal = $('a.share-button--email').attr('href').split('=')[1];
    const tags = undefined; // The HTML structure doesn't seem to contain a tags field
    await page.close();
    await browser.close();

    return {
      name,
      category,
      estimatedCookingTimeMinutes,
      complexity,
      images,
      videos,
      stepByStepGuide,
      ingredients,
      nutritionScore,
      linkToOriginal,
      tags,
    };
  }

  private async scrapeRecipeLinks(category: MealCategory) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://tasty.co/topic/${category}`);
    const buttonSelector = 'button.show-more-button';

    // Click the "Show More" button until it no longer exists
    let showMoreExists = await page.$(buttonSelector);
    while (showMoreExists) {
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click(buttonSelector)]);
      showMoreExists = await page.$(buttonSelector);
    }

    // Get the page content and load it into Cheerio
    const content = await page.content();
    const $ = cheerio.load(content);

    // Scrape the recipe links
    const recipeLinks = [];
    $('li.feed-item a').each((i, el) => {
      const link = $(el).attr('href');
      recipeLinks.push(`https://tasty.co${link}`);
    });

    await page.close();
    await browser.close();

    return recipeLinks;
  }
}
