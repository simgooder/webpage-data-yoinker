import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

class Scraper {
    constructor() {
        this.axios = axios;
        this.cheerio = cheerio;
    }

    async scrapeByClassName(url, className) {
        const response = await this.axios.get(url);
        const $ = this.cheerio.load(response.data);
        // Support multiple class names (e.g., 'foo bar' => '.foo.bar')
        const selector = '.' + className.trim().split(/\s+/).join('.');
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        let results = [];
        $(selector).each((i, el) => {
            const text = $(el).text();
            const matches = text.match(emailRegex);
            if (matches) {
                results.push(...matches);
            }
        });
        return results;
    }

    async scrapeById(url, id) {
        const response = await this.axios.get(url);
        const $ = this.cheerio.load(response.data);
        return $(`#${id}`).map((i, el) => $(el).text()).get();
    }

    async scrapeByRegex(url, regex) {
        const response = await this.axios.get(url);
        const $ = this.cheerio.load(response.data);
        const text = $('body').text();
        return text.match(regex) || [];
    }

    async scrapeByRegexPuppeteer(url, regex) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const text = await page.evaluate(() => document.body.innerText);
        await browser.close();
        return text.match(regex) || [];
    }

    async scrapeFacebookPageLink(url) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Find the first anchor with href containing 'facebook.com'
        const fbUrl = await page.evaluate(() => {
            const link = Array.from(document.querySelectorAll('a[href*="facebook.com"]'))[0];
            return link ? link.href : '';
        });
        await browser.close();
        return fbUrl ? [fbUrl] : [];
    }

    async scrapeByClassNamePuppeteer(url, className) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Support multiple class names (e.g., 'foo bar' => '.foo.bar')
        const selector = '.' + className.trim().split(/\s+/).join('.');
        const debug = await page.$$eval(selector, els => els.map(el => el.textContent.trim()));
        console.log(`DEBUG: Found ${debug.length} elements for selector '${selector}':`, debug);
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        let emails = [];
        debug.forEach(text => {
            const matches = text.match(emailRegex);
            if (matches) emails.push(...matches);
        });
        await browser.close();
        return emails;
    }
}

export default Scraper;