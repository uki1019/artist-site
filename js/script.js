document.addEventListener('DOMContentLoaded', () => {
  const bgImg    = document.querySelector('.bg-img');     // 背景图
  const logoWrap = document.querySelector('.logo-wrap');  // logo + 文字的容器
  const logoText = document.querySelector('.logo-text'); // 新增
  if (!bgImg || !logoWrap) return;

  // 安全添加：确保先渲染初始样式,再触发过渡
  const armReveal = () => {
    // 先确保初始状态（防重复刷新的残留）
    bgImg.classList.remove('loaded');
    logoWrap.classList.remove('loaded');
    logoText.classList.remove('loaded');

    // 双 rAF：等两帧再加类,100% 触发过渡
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bgImg.classList.add('loaded');      // 背景从模糊→清晰
        logoWrap.classList.add('loaded');   // logo+文字一起缩小/淡入
        logoText.classList.add('loaded'); // 让文字自己触发动画
        // console.log('[reveal] classes added');
      });
    });
  };

  // 图片加载完成后触发（含缓存场景）
  if (bgImg.complete) {
    bgImg.naturalWidth > 0 ? armReveal() : console.error('图片加载失败:', bgImg.src);
  } else {
    bgImg.addEventListener('load', armReveal, { once: true });
    bgImg.addEventListener('error', () => console.error('图片加载失败:', bgImg.src), { once: true });
  }

  // 兜底：如果一小段时间内还没触发,就强制执行一次
  setTimeout(() => {
    if (!bgImg.classList.contains('loaded')) {
      armReveal();
    }
  }, 300);
});
//-----------icon / 椭圆菜单
(() => {
  const btn  = document.querySelector('.orbit-btn');
  const menu = document.getElementById('ovalMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('is-open');
    menu.setAttribute(
      'aria-hidden',
      menu.classList.contains('is-open') ? 'false' : 'true'
    );
  });

  // 点击椭圆外侧区域关闭（可选）
  menu.addEventListener('click', (e) => {
    const box = menu.querySelector('.oval-bg').getBoundingClientRect();
    const x = e.clientX, y = e.clientY;
    if (x < box.left || x > box.right || y < box.top || y > box.bottom){
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
    }
  });
})();
// 下滑时：logo 微微上浮 + 轻缩放
(() => {
  const hero = document.querySelector('.hero');
  const logo = document.querySelector('.hero__logo');
  if (!hero || !logo) return;

  // 首帧后再允许过渡,避免刚载入就从"none"过渡到 transform
  requestAnimationFrame(() => document.body.classList.add('motion-ready'));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let heroTop = 0, heroH = 1, raf = 0;

  function measure(){
    const rect = hero.getBoundingClientRect();
    heroH = hero.offsetHeight;
    heroTop = window.scrollY + rect.top;
  }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  function update(){
    raf = 0;
    const y = window.scrollY;
    const p = clamp((y - heroTop) / heroH, 0, 1); // 0→1

    const maxShift = 60;   // 想更轻/重：30~60
    const minScale = 0.96; // 想更轻/重：0.96~0.92

    const ty = -maxShift * p;
    const s  = 1 - (1 - minScale) * p;

    // 关键：只改变量,不改 transform 属性
    logo.style.setProperty('--ty', `${ty}px`);
    logo.style.setProperty('--s',  s);
  }

  function onScroll(){ if (!raf && !reduce) raf = requestAnimationFrame(update); }

  measure(); update();
  addEventListener('resize', () => { measure(); update(); }, { passive: true });
  addEventListener('scroll', onScroll, { passive: true });
})();
// 无缝滚动：把内容克隆一份拼接在后面,并按内容宽度自动计算动画时长
(() => {
  const track = document.getElementById('bigtypeTrack');
  if (!track) return;

  // 先记下原始宽度,再克隆一份
  const originalHTML = track.innerHTML.trim();
  const temp = document.createElement('div');
  temp.style.display = 'inline-flex';
  temp.style.gap = getComputedStyle(track).gap;
  temp.innerHTML = originalHTML;
  document.body.appendChild(temp);
  const singleWidth = temp.scrollWidth;       // 一份内容的真实像素宽度
  temp.remove();

  track.innerHTML = originalHTML + originalHTML; // 拼成两份

  // 速度（像素/秒）,数值越小越慢。按你喜好改：
  const speed = 4; // e.g. 30~60 都是慢速区
  const duration = singleWidth / speed;       // 只需跑一份宽度（50%）
  track.style.setProperty('--dur', `${duration}s`);
})();

// -------- 通用 YouTube 预览卡片：点击后在 YouTube 打开新标签 --------
(() => {
  const cards = document.querySelectorAll('.yt-card[data-yt-id]');
  if (!cards.length) return;

  cards.forEach(card => {
    const id = card.getAttribute('data-yt-id');
    if (!id) return;

    // 如果没写内部内容,自动补一个带播放按钮和日文文案的层
    if (!card.firstElementChild) {
      const inner = document.createElement('div');
      inner.className = 'yt-card__inner';
      inner.innerHTML = `
        <div class="yt-card__play"></div>
        <div class="yt-card__label">YouTubeで見る</div>
      `;
      card.appendChild(inner);
    }

    // 点击在新标签打开对应视频
    card.addEventListener('click', () => {
      const url = `https://www.youtube.com/watch?v=${id}`;
      window.open(url, '_blank', 'noopener');
    });
  });
})();
