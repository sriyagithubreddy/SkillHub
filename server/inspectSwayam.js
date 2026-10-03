fetch('https://swayam.gov.in/search_courses')
  .then(r => r.text())
  .then(t => {
    const terms = [
      'Next',
      'Previous',
      'next',
      'previous',
      'pagination',
      '100'
    ];

    for (const term of terms) {
      console.log('\n===== ' + term + ' =====');

      let index = t.indexOf(term);

      if (index === -1) {
        console.log('NOT FOUND');
      } else {
        console.log(
          t.substring(
            Math.max(0, index - 800),
            index + 1200
          )
        );
      }
    }
  })
  .catch(e => console.error(e.message));
