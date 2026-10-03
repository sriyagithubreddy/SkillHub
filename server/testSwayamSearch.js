const urls = [
  'https://swayam.gov.in/search_courses?searchText=programming',
  'https://swayam.gov.in/search_courses?searchText=data%20science',
  'https://swayam.gov.in/search_courses?searchText=machine%20learning'
];

async function test() {
  for (const url of urls) {
    const html = await fetch(url).then(r => r.text());

    const links = [
      ...html.matchAll(
        /href="(https:\/\/onlinecourses\.swayam2\.ac\.in\/[^"]+)"/g
      )
    ].map(m => m[1]);

    console.log('\nURL:', url);
    console.log('COURSES:', new Set(links).size);
    console.log('FIRST:', [...new Set(links)].slice(0, 3));
  }
}

test().catch(console.error);
