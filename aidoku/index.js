const Aidoku = require("aidoku");

async function fetchMangaList(page) {
    let url = `https://e-hentai.org/?page=${page}`;
    return await scrapeGalleryList(url);
}

async function fetchSearchResults(query, page) {
    let url = `https://e-hentai.org/?f_search=${encodeURIComponent(query)}&page=${page}`;
    return await scrapeGalleryList(url);
}

async function scrapeGalleryList(url) {
    let response = await fetch(url);
    let html = await response.text();
    let doc = Aidoku.Html.parse(html);

    let items = doc.select(".itg tr:not(:first-child)");
    let mangaList = [];

    for (let item of items) {
        let title = item.select(".glink").text();
        let id = item.select(".glname a").attr("href");
        let cover_url = item.select("img").attr("src");

        if (id) {
            mangaList.push({
                id: id,
                title: title,
                cover_url: cover_url
            });
        }
    }

    return mangaList;
}

async function fetchMangaDetails(mangaId) {
    let response = await fetch(mangaId);
    let html = await response.text();
    let doc = Aidoku.Html.parse(html);

    let title = doc.select("#gn").text();
    let author = doc.select("#gdn").text() || "Unknown";
    let tags = doc.select("#taglist tr td a").map(a => a.text());

    return {
        id: mangaId,
        title: title,
        author: author,
        genres: tags
    };
}

async function fetchChapterList(mangaId) {
    return [{
        id: mangaId,
        title: "Full Gallery",
        pages: await countPages(mangaId)
    }];
}

async function countPages(mangaId) {
    let response = await fetch(mangaId);
    let html = await response.text();
    let doc = Aidoku.Html.parse(html);
    return doc.select("#gdt .gdtm a").length;
}

async function fetchPageList(chapterId) {
    let response = await fetch(chapterId);
    let html = await response.text();
    let doc = Aidoku.Html.parse(html);

    let pages = doc.select("#gdt .gdtm a").map(a => a.attr("href"));

    let imageLinks = [];
    for (let pageUrl of pages) {
        let pageResponse = await fetch(pageUrl);
        let pageHtml = await pageResponse.text();
        let pageDoc = Aidoku.Html.parse(pageHtml);

        let imageUrl = pageDoc.select("#img").attr("src");
        if (imageUrl) imageLinks.push({ url: imageUrl });
    }

    return imageLinks;
}

module.exports = { 
    fetchMangaList, 
    fetchMangaDetails, 
    fetchChapterList, 
    fetchPageList, 
    fetchSearchResults 
};
