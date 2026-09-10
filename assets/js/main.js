(() => {
  const PRODUCTS = [
    {
      id: "seacurrent",
      label: "Arus permukaan (HYCOM)",
      dir: "figures/spatial/hycom/seacurrent",
    },
    {
      id: "swh",
      label: "Significant wave height (GFS Wave)",
      dir: "figures/spatial/gfs/swh",
    },
    {
      id: "swell",
      label: "Primary swell (GFS Wave)",
      dir: "figures/spatial/gfs/swell",
    },
    {
      id: "wind10m",
      label: "Angin 10 m (GFS Atmos)",
      dir: "figures/spatial/gfs/wind10m",
    },
  ];

  /** Build 3-hourly stamps from 2025-12-23 00Z through 2025-12-29 21Z */
  function buildStamps() {
    const out = [];
    const start = Date.UTC(2025, 11, 23, 0, 0, 0);
    const end = Date.UTC(2025, 11, 29, 21, 0, 0);
    for (let t = start; t <= end; t += 3 * 3600 * 1000) {
      const d = new Date(t);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      const h = String(d.getUTCHours()).padStart(2, "0");
      out.push(`${y}${m}${day}${h}`);
    }
    return out;
  }

  function formatStamp(stamp) {
    const y = stamp.slice(0, 4);
    const m = stamp.slice(4, 6);
    const d = stamp.slice(6, 8);
    const h = stamp.slice(8, 10);
    return `${y}-${m}-${d} ${h}:00 UTC`;
  }

  function initViewer() {
    const root = document.getElementById("spatial-viewer");
    if (!root) return;

    const productSelect = root.querySelector("[data-product]");
    const timeRange = root.querySelector("[data-time]");
    const readout = root.querySelector("[data-readout]");
    const img = root.querySelector("[data-frame]");
    const stamps = buildStamps();
    const eventIdx = stamps.indexOf("2025122612");

    PRODUCTS.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.label;
      productSelect.appendChild(opt);
    });

    timeRange.min = "0";
    timeRange.max = String(stamps.length - 1);
    timeRange.value = String(eventIdx >= 0 ? eventIdx : 0);
    timeRange.step = "1";

    function currentProduct() {
      return PRODUCTS.find((p) => p.id === productSelect.value) || PRODUCTS[0];
    }

    function render() {
      const idx = Number(timeRange.value);
      const stamp = stamps[idx];
      const product = currentProduct();
      const src = `${product.dir}/t_${stamp}.png`;
      readout.textContent = formatStamp(stamp);
      img.classList.remove("is-ready");
      const next = new Image();
      next.onload = () => {
        img.src = src;
        img.alt = `${product.label} — ${formatStamp(stamp)}`;
        img.classList.add("is-ready");
      };
      next.onerror = () => {
        img.removeAttribute("src");
        img.alt = "Frame tidak tersedia";
        img.classList.add("is-ready");
      };
      next.src = src;
    }

    productSelect.addEventListener("change", render);
    timeRange.addEventListener("input", render);
    render();
  }

  document.addEventListener("DOMContentLoaded", initViewer);
})();
