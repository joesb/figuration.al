function activePath(itemUrl, currentUrl) { 
  return (currentUrl && currentUrl.startsWith(itemUrl)) ? true : false;
}

function getCollectionByName(collections, name, sort = false) {
  let c = collections[name];
  return sort ? this.sortByOrder(c) : c;
}

function sortByOrder(collection) {
  return collection.sort((a, b) => {
    a.data.order = a.data.order ? a.data.order : 0;
    b.data.order = b.data.order ? b.data.order : 0;
    if (a.data.order < b.data.order) return -1;
    else if (a.data.order > b.data.order) return 1;
    else return 0;
  });
}

export default {activePath, getCollectionByName, sortByOrder};