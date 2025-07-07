// This file is the entry point of the application. It initializes the web scraper, processes input for the array of webpages, and handles user input for targeting by classname, ID, or regex.

import fs from 'fs';
import readline from 'readline';
import Scraper from './scraper.js';
import { convertToCSV } from './utils/csv.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const scraper = new Scraper();

const askQuestions = () => {
    rl.question('Enter an array of webpages (comma-separated): ', async (webpagesInput) => {
        const webpages = webpagesInput.split(',').map(url => url.trim());

        rl.question('Enter targeting method (className, id, regex): ', async (targetMethod) => {
            if (targetMethod.toLowerCase() === 'regex') {
                rl.question('Extract what? (email/facebook/instagram/custom): ', async (extractType) => {
                    let regexOrSelector;
                    let useFacebook = false;
                    let useInstagram = false;
                    let linkIndex = 0;
                    if (extractType.toLowerCase() === 'facebook' || extractType.toLowerCase() === 'instagram') {
                        rl.question('Which instance? (1 for first, 2 for second, etc.): ', async (instanceInput) => {
                            linkIndex = Math.max(0, parseInt(instanceInput) - 1 || 0);
                            if (extractType.toLowerCase() === 'facebook') {
                                useFacebook = true;
                            } else {
                                useInstagram = true;
                            }
                            await processScrape(webpages, targetMethod, regexOrSelector, useFacebook, useInstagram, linkIndex);
                        });
                        return;
                    }
                    if (extractType.toLowerCase() === 'email') {
                        regexOrSelector = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
                        await processScrape(webpages, targetMethod, regexOrSelector, false, false, 0);
                    } else {
                        rl.question('Enter the custom regex (e.g. /pattern/flags): ', async (targetValue) => {
                            if (!targetValue) {
                                regexOrSelector = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
                            } else if (typeof targetValue === 'string') {
                                const match = targetValue.match(/^\/(.*)\/(.*)?$/);
                                if (match) {
                                    regexOrSelector = new RegExp(match[1], match[2] || undefined);
                                } else {
                                    regexOrSelector = new RegExp(targetValue);
                                }
                            }
                            await processScrape(webpages, targetMethod, regexOrSelector, false, false, 0);
                        });
                    }
                });
            } else {
                rl.question('Enter the target value: ', async (targetValue) => {
                    await processScrape(webpages, targetMethod, targetValue, false, false);
                });
            }
        });
    });
};

// Add processScrape function to handle the scraping logic
async function processScrape(webpages, targetMethod, targetValue, useFacebook, useInstagram, linkIndex = 0) {
    let results = [];
    try {
        for (let i = 0; i < webpages.length; i++) {
            const url = webpages[i];
            console.log(`Scraping ${i + 1}/${webpages.length}: ${url}`);
            let res;
            switch (targetMethod.toLowerCase()) {
                case 'classname':
                    // Use Puppeteer for className to support JS-rendered content
                    res = await scraper.scrapeByClassNamePuppeteer(url, targetValue);
                    break;
                case 'id':
                    res = await scraper.scrapeById(url, targetValue);
                    break;
                case 'regex':
                    if (useFacebook) {
                        res = await scraper.scrapeFacebookPageLink(url, linkIndex);
                    } else if (useInstagram) {
                        res = await scraper.scrapeInstagramPageLink(url, linkIndex);
                    } else {
                        res = await scraper.scrapeByRegexPuppeteer(url, targetValue);
                    }
                    break;
                default:
                    console.log('Invalid targeting method. Please use className, id, or regex.');
                    rl.close();
                    return;
            }
            if (Array.isArray(res) && res.length > 0) {
                results.push({ url, value: res[0] });
            } else if (!Array.isArray(res) && res) {
                results.push({ url, value: res });
            } else {
                results.push({ url, value: '' });
            }
        }
        if (results.length === 0) {
            console.log('No results found. No output file created.');
        } else {
            const csvOutput = convertToCSV(results);
            fs.writeFileSync('output.csv', csvOutput);
            console.log('Scraping completed. Results saved to output.csv');
        }
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        rl.close();
    }
}

askQuestions();