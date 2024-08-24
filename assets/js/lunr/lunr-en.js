

// Initialize lunr index
const idx = lunr(function () {
  this.field('title');
  this.field('excerpt');
  this.field('categories');
  this.field('tags');
  this.ref('id');

  this.pipeline.remove(lunr.trimmer);

  for (const [id, item] of Object.entries(store)) {
    this.add({
      title: item.title,
      excerpt: item.excerpt,
      categories: item.categories,
      tags: item.tags,
      id: id
    });
  }
});

// Function to create search result HTML
const createSearchResult = (ref) => {
  const item = store[ref];
  const title = `<h2 class="archive__item-title"><a href="${item.url}" rel="permalink">${item.title}</a></h2>`;
  const excerpt = `<p class="archive__item-excerpt">${item.excerpt.split(" ").slice(0, 20).join(" ")}...</p>`;
  const teaser = item.teaser ? `<div class="archive__item-teaser"><img src="${item.teaser}" alt=""></div>` : '';

  return `
    <div class="list__item">
      <article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork">
        ${title}
        ${teaser}
        ${excerpt}
      </article>
    </div>
  `;
};

// Perform search when document is ready
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const resultDiv = document.getElementById('results');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const results = idx.query((q) => {
      query.split(lunr.tokenizer.separator).forEach((term) => {
        q.term(term, { boost: 100 });
        if (!query.endsWith(" ")) {
          q.term(term, { usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 });
        }
        if (term !== "") {
          q.term(term, { usePipeline: false, editDistance: 1, boost: 1 });
        }
      });
// Initialize lunr index
      const idx = lunr(function () {
        this.field('title');
        this.field('excerpt');
        this.field('categories');
        this.field('tags');
        this.ref('id');

        this.pipeline.remove(lunr.trimmer);

        for (const [id, item] of Object.entries(store)) {
          this.add({
            title: item.title,
            excerpt: item.excerpt,
            categories: item.categories,
            tags: item.tags,
            id: id
          });
        }
      });

// Function to create search result HTML
      const createSearchResult = (ref) => {
        const item = store[ref];
        const title = `<h2 class="archive__item-title"><a href="${item.url}" rel="permalink">${item.title}</a></h2>`;
        const excerpt = `<p class="archive__item-excerpt">${item.excerpt.split(" ").slice(0, 20).join(" ")}...</p>`;
        const teaser = item.teaser ? `<div class="archive__item-teaser"><img src="${item.teaser}" alt=""></div>` : '';

        return `
    <div class="list__item">
      <article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork">
        ${title}
        ${teaser}
        ${excerpt}
      </article>
    </div>
  `;
      };

// Perform search when document is ready
      document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('search');
        const resultDiv = document.getElementById('results');

        searchInput.addEventListener('input', () => {
          const query = searchInput.value.toLowerCase();
          const results = idx.query((q) => {
            query.split(lunr.tokenizer.separator).forEach((term) => {
              q.term(term, { boost: 100 });
              if (!query.endsWith(" ")) {
                q.term(term, { usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 });
              }
              if (term !== "") {
                q.term(term, { usePipeline: false, editDistance: 1, boost: 1 });
              }
            });
          });

          // Display results
          resultDiv.innerHTML = `<p class="results__found">${results.length} Result(s) found</p>`;
          results.forEach((result) => {
            resultDiv.innerHTML += createSearchResult(result.ref);
          });
        });
      });
    });

    // Display results
    resultDiv.innerHTML = `<p class="results__found">${results.length} Result(s) found</p>`;
    results.forEach((result) => {
      resultDiv.innerHTML += createSearchResult(result.ref);
    });
  });
});