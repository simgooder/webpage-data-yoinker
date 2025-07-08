# Readme

## Instructions for a get-facebook-or-instagram-page-url-from-directory-then-get-email-from-facebook-page workflow
1. Find directory page with a list of links you want to pull.
2. Identify the selector, and adjust the Extract HREFs from a page script below.
3. Run the updated script in the console of the page you want to extract the links from.
4. Open a terminal, and type `npm start`
5. Paste the list of comma-separated URLs that you got from the console log
6. Choose "regex", press enter
7. Choose "facebook" to get the facebook link from each page. Choose "instagram" to get the instagram link from each page.
8. Select which "instance" of the URL you need. Sometimes a directory site will have links to their own social media in the header of the page, so you'd go for the _second_ instance in that case.
9. The script will run, and once completed, you will have all available URLs in the `output.csv` file.
10. Once you have the facebook links, run the script again using `npm start`
11. Paste the list of comma-separated facebook page URLs. This will only work for facebook page URLs, since the email is not visible on profile pages.
12. Choose "regex", press enter
13. Choose "email", press enter.
14. The script will run, and once completed, you will have all available URLs in the `output.csv` file.

## Run it
`npm start`

## Extract HREFs from a page
```
(() => {
  const links = Array.from(document.querySelectorAll('.ih-item a'))
    .map(el => el.href.trim().replace(/\/$/, '').split('#')[0]) // normalize
    .filter(href => href);

  const uniqueLinks = Array.from(new Set(links));

  console.log(uniqueLinks.join(','));
})();
```


## Regex
```
https?:\/\/(www\.)?facebook\.com\/[^\s"']+
```