// when we have Cloudflare security : check human action then use  1. puppeteer-extra and 2. puppeteer-extra-plugin-stealth
//const puppeteer = require('puppeteer-extra');
//const StealthPlugin = require('puppeteer-extra-plugin-stealth');
//puppeteer.use(StealthPlugin());
// see part 2 code

// =============================  Part 1 without security =============================
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const APP_URL = "https://apps.shopify.com/inbox";
  (async () => {

    // Launch the browser and open a new blank page
    const reviewUrls = []
    for (let index = 1; index <= 347; index++) {
      reviewUrls.push(`${APP_URL}/reviews?page=${index}`)
    }
    const pageSize = 10;
    const result = await paginateAndFetchData(reviewUrls, pageSize)
    if (result) {
      const data = flattenArray(result)
      const groupedData = [["App Name", "Company", "Country", "Date", "Review Count", "Review", "Total Reviews"]];
      for (let i = 0; i < data.length; i += 7) {
        groupedData.push(data.slice(i, i + 7));
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
  let getReviews = await page.evaluate(async () => {
    let divs = [...document.querySelectorAll('[data-merchant-review]')];
    return divs.map((div) => {
      const AppName = document.querySelector(".tw-mb-auto .tw-flex.tw-flex-col-reverse .tw-block").textContent.trim().replace(/\n/g, "")
      const totalReviews = document.querySelector(".tw-mb-auto .tw-flex.tw-flex-col-reverse .tw-text-body-md.tw-text-fg-tertiary").textContent.trim().replace(/\n/g, "")
      const companySelector = div.querySelector(".tw-order-2.tw-space-y-1.tw-text-fg-tertiary.tw-text-body-xs")
      const review = div.querySelector('[data-truncate-content-copy]').textContent.trim().replace(/\n/g, "")
      const company = div.querySelector(".tw-whitespace-nowrap").textContent.trim().replace(/\n/g, "")
      const country = companySelector.childNodes[3].textContent.trim().replace(/\n/g, "")
      const reviewCount = div.querySelector(".tw-flex.tw-relative.tw-h-md").ariaLabel
      const date = div.querySelector(".tw-text-body-xs.tw-text-fg-tertiary").textContent.trim().replace(/\n/g, "")
      return [AppName, company, country, date, reviewCount, review, totalReviews]
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
// =============================  Part 2 with security =============================
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const XLSX = require('xlsx');
const APP_URL = "https://coatings.specialchem.com/online-course";
  (async () => {

    // Launch the browser and open a new blank page
    const myUrl=[]
    const reviewUrls = [
        50111, 1147, 50078, 50101,
         50020, 50117, 1172, 1095, 10067, 10049,
        10052, 50008, 1127, 1158, 1096, 10068, 10042, 50044, 1166, 50037,
        50084, 50043, 50040, 1139, 50081, 50021, 1089, 10076, 10044, 50065,
        50068, 50075, 50063, 50047, 10035, 10006, 10051, 10058, 922, 1159,
        50039, 1171, 10071, 50010, 50119, 921, 50053, 1150, 50096, 50079,
        10072, 50109, 10062, 1051, 1090, 50076, 50073, 10007, 50045, 1146,
        50091, 50110, 1092, 1104, 1113, 1100, 50104, 10041, 10069, 10056,
        50130, 50122, 50123, 50112, 1118, 50051, 50106, 50038, 1098, 10043,
        10066, 50095, 50049, 1115, 10070, 1162, 1141, 1148, 50121, 50071,
        50120, 10025, 50108, 50127, 50131, 50100, 50046, 50033, 50072, 50074,
        50099, 50089, 50086, 10036, 50124, 10053, 10054, 10061, 50041, 1088,
        50094, 10033, 50055, 50103, 50126, 50052, 10028, 1091, 1110, 50022,
        10060, 50029, 1167, 1097, 1114, 10078, 50113, 1131, 1173, 10039, 1107,
        50015, 1155, 50017, 10064, 1116, 1133, 1152, 10057, 10077, 10055, 50062,
        1135, 50050, 50027, 50048, 862, 10040, 1157, 1143, 1137, 1136, 50019,
        1140, 50016, 10029, 10063, 1144, 1132, 10050, 1163, 50018, 1154, 1112,
        775, 1117, 1134, 991, 1149, 50070, 50023, 1138, 50042, 1169, 50035,
        1129, 10047, 1099, 50014, 50064, 10038, 1106, 1121, 50013, 50129, 50125,
        50087, 50090, 50069, 1094, 50011, 50034, 50028, 10037
      ];
      
      
    for (let index = 0; index <= reviewUrls.length; index++) {
        const id=reviewUrls[index]
        myUrl.push(`${APP_URL}/${id}`)
    }
    const pageSize = 1;
    const result = await paginateAndFetchData(myUrl, pageSize)
    if (result) {
      const data = flattenArray(result)
      const groupedData = [["Course ID" ,"Image URL",]];
      for (let i = 0; i < data.length; i += 2) {
        groupedData.push(data.slice(i, i + 2));
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
     

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
  // Navigate the page to a URL
  await page.goto(url,{ waitUntil: 'networkidle2' });
  // Iterate over the elements 
  const id=url.replace("https://coatings.specialchem.com/online-course/","")
    // Iterate over the elements 
    let getReviews = await page.evaluate(async (id) => {
        let divs = [...document.querySelectorAll('.pushbox4.b2.float.p8.acenter')];
        return divs.map((div) => {
          let imageSrc = div.querySelector("img")?.src
          if(imageSrc){
            imageSrc= imageSrc.slice(0,imageSrc.indexOf("?h"))
          }
          return [id,imageSrc]
        });
      },id)
    //   console.log(getReviews,'getReviewsgetReviews')
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
    console.error('Error fetching data:', error);
  }
}
function flattenArray(arr) {
  return arr.reduce((acc, val) => {
    return Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val);
  }, []);
}
