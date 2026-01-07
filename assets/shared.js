// shared: store last page + timestamp
(function(){
  try {
    if (window.__PAGE_ID__) {
      localStorage.setItem("last_page", window.__PAGE_ID__);
      localStorage.setItem("last_seen_at", Date.now().toString());
    }
  } catch(e) {}
})();
