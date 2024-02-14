const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
(async () => {
  // Launch the browser and open a new blank page
  const reviewUrls = []
  for (let index = 1; index <= 346; index++) {
    reviewUrls.push(`https://apps.shopify.com/inbox/reviews?page=${index}`)
  }
  const pageSize = 10;
  const result = await paginateAndFetchData(reviewUrls, pageSize)
  if (result) {
    const data = flattenArray(result)
    const groupedData = [["Company", "Review Count","Review"]];
    for (let i = 0; i < data.length; i += 3) {
      groupedData.push(data.slice(i, i + 3));
    }
    const workbook = XLSX.utils.book_new();
    // Convert the array data to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(groupedData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'output.xlsx');
    console.log("Task Done")

  }
})();

async function fetchAllReview(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Navigate the page to a URL
  await page.goto(url);
  // click all showmore buttons
  await page.evaluate(() => {
    let divs = [...document.querySelectorAll('[data-truncate-content-toggle]')];
    return divs.map((div) => {
      return div.click()
    });
  })
  // Iterate over the elements 
  let getReviews = await page.evaluate(() => {
    let divs = [...document.querySelectorAll('[data-merchant-review]')];
    return divs.map((div) => {
      const review = div.querySelector('[data-truncate-content-copy]').textContent.trim().replace(/\n/g, "")
      const company = div.querySelector(".tw-whitespace-nowrap").textContent.trim().replace(/\n/g, "")
      const reviewCount = div.querySelector(".tw-flex.tw-relative.tw-h-md").ariaLabel
      return [company, reviewCount, review]
    });
  })
  await browser.close();
  return getReviews
}

async function fetchDataBatch(apiUrls) {
  return await Promise.all(apiUrls.map((url) => fetchAllReview(url)))
}
// Function to paginate through API URLs and fetch data
async function paginateAndFetchData(allApiUrls, pageSize) {
  try {
    const results = [];
    const totalUrls = allApiUrls.length;
    for (let i = 0; i < totalUrls; i += pageSize) {
      const batch = allApiUrls.slice(i, i + pageSize);
      const batchResults = await fetchDataBatch(batch);
      results.push(batchResults);
    }
    return results
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}
function flattenArray(arr) {
  return arr.reduce((acc, val) => {
    return Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val);
  }, []);
}
