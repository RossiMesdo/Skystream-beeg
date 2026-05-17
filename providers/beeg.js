const BASE = "https://beeg.com";
const API = "https://store.externulls.com";

var plugin = {
  id: "beeg",
  name: "Beeg",
  version: "1.0.0",

  async search(query) {
    const res = await fetch(
      `${API}/tag/recommends?type=person&slug=index`
    );

    const json = await res.json();

    return json
      .filter(x =>
        (x.tg_name || "")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .map(x => {
        const crop = x?.thumbs?.[0]?.crops?.[0];

        let poster = "";

        if (crop) {
          poster =
            `https://thumbs.externulls.com/photos/${crop.pt_photo}/to.webp?crop_id=${crop.id}&size_new=112x112`;
        }

        return {
          title: x.tg_name,
          url: `${BASE}/${x.tg_slug}`,
          poster
        };
      });
  },

  async load(url) {
    const slug = url.split("/").pop();

    const res = await fetch(
      `${API}/tag/videos/${slug}?limit=48&offset=0`
    );

    const json = await res.json();

    return json.map(video => {
      const file = video.file;
      const data = file.data?.[0];

      return {
        title: data?.cd_value || "Video",
        poster:
          `https://thumbs.externulls.com/videos/${video.id}/0.webp?size=480x270`,
        data: JSON.stringify(file)
      };
    });
  },

  async loadLinks(data) {
    const json = JSON.parse(data);

    if (json?.hls_resources?.fl_cdn_multi) {
      return [{
        url:
          `https://video.beeg.com/${json.hls_resources.fl_cdn_multi}`,
        type: "m3u8",
        headers: {
          Referer: `${BASE}/`
        }
      }];
    }

    return [];
  }
};

plugin;
