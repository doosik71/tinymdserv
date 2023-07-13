var remote_datetime = null;
const datetime_url = window.location.href + ".__datetime__";

async function autoupdate_get_datetime() {
  let response = await fetch(datetime_url);
  return await response.text();
}

function autoupdate_refresh() {
  if (remote_datetime) {
    autoupdate_get_datetime().then(function(response) {
      if (remote_datetime != response) {
        console.log("refreshed!!!");
        window.location.reload();
      }
    });
  }
}

function autoupdate_register(seconds) {
  autoupdate_get_datetime().then(response => remote_datetime = response);
  setInterval(autoupdate_refresh, seconds * 1000);
}
