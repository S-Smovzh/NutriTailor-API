import { Inject, Injectable, Logger } from '@nestjs/common';
import { PuppeteerLaunchOptions, WaitForOptions } from 'puppeteer';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { MealRepository, ProductRepository } from '../../repositories';
import { MealCategory, Measurement } from '../../enums';

const pLimit = require('p-limit');
const chalk = require('chalk');

const limit = pLimit(1);

const MIN_RECORDS_IN_COLLECTION = 100;
const PAGE_PUPPETEER_OPTS: WaitForOptions = {
  waitUntil: 'networkidle2',
  timeout: 10000,
};
const PUPPETEER_LAUNCH_OPTS: PuppeteerLaunchOptions = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

@Injectable()
export class ScriptService {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(MealRepository)
    private readonly mealRepository: MealRepository,
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {}

  public async startSeed() {
    console.log(chalk.green('********** SCRIPT HAS STARTED **********'));
    const { breakfast, lunch, dinner } = await this.isSeeded();

    if (breakfast < MIN_RECORDS_IN_COLLECTION) {
      const links = await this.scrapeRecipeLinks(breakfast, MealCategory.BREAKFAST);
      console.log(chalk.white(`Seeding ${MealCategory.BREAKFAST}: ${links.slice(breakfast).length} items to seed`));
      await Promise.all(
        links.slice(breakfast).map((data) =>
          limit(async () => {
            await this.scrapeRecipe(data.linkToOriginal, MealCategory.BREAKFAST, data);
          }),
        ),
      );
    }
    if (lunch < MIN_RECORDS_IN_COLLECTION) {
      const links = await this.scrapeRecipeLinks(lunch, MealCategory.LUNCH);
      console.log(chalk.white(`Seeding ${MealCategory.LUNCH}: ${links.slice(lunch).length} items to seed`));
      await Promise.all(
        links.slice(lunch).map((data) =>
          limit(async () => {
            await this.scrapeRecipe(data.linkToOriginal, MealCategory.LUNCH, data);
          }),
        ),
      );
    }
    if (dinner < MIN_RECORDS_IN_COLLECTION) {
      const links = await this.scrapeRecipeLinks(dinner, MealCategory.DINNER);
      console.log(chalk.white(`Seeding ${MealCategory.DINNER}: ${links.slice(dinner).length} items to seed`));
      await Promise.all(
        links.slice(dinner).map((data) =>
          limit(async () => {
            await this.scrapeRecipe(data.linkToOriginal, MealCategory.DINNER, data);
          }),
        ),
      );
    }

    console.log(chalk.green('********** SCRIPT HAS ENDED **********'));
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

  private async scrapeRecipe(
    url: string,
    category: MealCategory,
    data: { linkToOriginal: string; estimatedCookingTimeMinutes: number; tags: string[]; image: string },
  ) {
    console.log(chalk.blue(`Opening page ${url}`));
    let browser = null;
    let page = null;

    try {
      browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTS);
      page = await browser.newPage();
      await page.goto(url, PAGE_PUPPETEER_OPTS);
      const content = await page.content();
      const $ = cheerio.load(content);

      const name = $('h1.recipe-name').text().trim();
      // const estimatedCookingTimeMinutes = parseInt($('.recipe-time-container p').first().text().trim().split(' ')[0]);
      const complexity = undefined; // The HTML structure doesn't seem to contain a complexity field
      const images = []; // The HTML structure doesn't seem to contain a video field
      const videos = []; // The HTML structure doesn't seem to contain a video field
      const stepByStepGuide = $('ol.prep-steps li')
        .map((i, el) => $(el).text().replace(/\n/g, '/n').replace(/\n\n/g, '/p').trim())
        .get()
        .join(' ');
      const ingredients = $('ul.list-unstyled li.ingredient')
        .map((i, el) => $(el).text().trim())
        .get();
      const nutritionScore = $('.nutrition-details li.list-unstyled')
        .map((i, el) => $(el).text().trim())
        .get()
        .join(' / ');

      const products = await Promise.all(
        ingredients.map(async (ingredient) => {
          ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ').trim();
          let [amount, measurement, ...name] = ingredient.split(' ');

          if (!Number.isInteger(+amount)) {
            amount = '1';
          }

          if (!Object.values(Measurement).includes(measurement as Measurement)) {
            if (name.length < 1) {
              return null;
            }

            measurement = name.shift();
            if (!Object.values(Measurement).includes(measurement as Measurement)) {
              return null;
            }
          }

          const existingProduct = await this.productRepository.findOne({
            amount: +amount,
            measurement: measurement as Measurement,
            name: name.join(' '),
          });

          if (existingProduct) {
            return existingProduct;
          }

          return this.productRepository.create({
            amount: +amount,
            measurement: measurement as Measurement,
            name: name.join(' '),
          });
        }),
      );

      // console.log(
      //   JSON.stringify({
      //     name,
      //     category,
      //     estimatedCookingTimeMinutes: data.estimatedCookingTimeMinutes,
      //     complexity,
      //     images: [data.image, ...images],
      //     videos,
      //     stepByStepGuide,
      //     ingredients: products.filter((val) => !!val).map(({ _id }) => _id),
      //     nutritionScore,
      //     linkToOriginal: url,
      //     tags: data.tags,
      //   }),
      // );

      if (page) await page.close();
      if (browser) await browser.close();

      await this.mealRepository.create({
        name,
        category,
        estimatedCookingTimeMinutes: data.estimatedCookingTimeMinutes,
        complexity,
        images: [data.image, ...images],
        videos,
        stepByStepGuide,
        ingredients: products.filter((val) => !!val).map(({ _id }) => _id),
        nutritionScore,
        linkToOriginal: url,
        tags: data.tags,
      });
      console.log(chalk.blue(`Document with name ${name} composed and created at ${new Date().toUTCString()}`));
    } catch (err) {
      console.log(chalk.red(err));
    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
    }
  }

  private async scrapeRecipeLinks(
    dataInDB: number,
    category: MealCategory,
  ): Promise<{ linkToOriginal: string; estimatedCookingTimeMinutes: number; tags: string[]; image: string }[]> {
    const response = await axios.get(
      `https://tasty.co/api/proxy/tasty/feed-page?from=${dataInDB}&size=${MIN_RECORDS_IN_COLLECTION}&slug=${category}&type=topic`,
    );

    if (!response.data || !response.data.items || !response.data.items.length) {
      return [];
    }

    return response.data.items.map(({ slug, times, tags, thumbnail_url }) => ({
      linkToOriginal: `https://tasty.co/recipe/${slug}`,
      estimatedCookingTimeMinutes: +times?.total_time?.minutes,
      image: thumbnail_url,
      tags,
    }));
  }
}
