/* ============================================================
   FPP v2 — i18n.js
   URL 기반 언어 전환, 공통 UI 번역, 언어팩 로더
   ============================================================ */
(function (root) {
  'use strict';

  var LANGS = ['ko', 'en', 'ja', 'zh-cn', 'zh-tw'];
  var NAMES = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    'zh-cn': '简体中文',
    'zh-tw': '繁體中文'
  };

  /* [한국어, English, 日本語, legacy slot, 简体中文, 繁體中文] */
  var P = {
    'FPP v2 — 원피스 파이팅패스 커뮤니티': ['FPP v2 — 원피스 파이팅패스 커뮤니티', 'FPP v2 — One Piece Fighting Path Community', 'FPP v2 — ワンピース・ファイティングパスコミュニティ', 'FPP v2 — ชุมชน One Piece Fighting Path', 'FPP v2 — 海贼王 Fighting Path 社区', 'FPP v2 — 航海王 Fighting Path 社群'],
    '커뮤니티 — FPP v2': ['커뮤니티 — FPP v2', 'Community — FPP v2', 'コミュニティ — FPP v2', 'ชุมชน — FPP v2', '社区 — FPP v2', '社群 — FPP v2'],
    '고객센터 — FPP v2': ['고객센터 — FPP v2', 'Support — FPP v2', 'カスタマーサポート — FPP v2', 'ศูนย์บริการลูกค้า — FPP v2', '客服中心 — FPP v2', '客服中心 — FPP v2'],
    '로그인 — FPP v2': ['로그인 — FPP v2', 'Log in — FPP v2', 'ログイン — FPP v2', 'เข้าสู่ระบบ — FPP v2', '登录 — FPP v2', '登入 — FPP v2'],
    '홈': ['홈', 'Home', 'ホーム', 'หน้าหลัก', '首页', '首頁'],
    '메인 홈': ['메인 홈', 'Main home', 'メインホーム', 'หน้าหลัก', '主頁', '主頁'],
    '캐릭터': ['캐릭터', 'Characters', 'キャラクター', 'ตัวละคร', '角色', '角色'],
    '현질 서폿 캐릭터': ['현질 서폿 캐릭터', 'Support characters', 'サポートキャラクター', 'ตัวละครซัพพอร์ต', '辅助角色', '輔助角色'],
    'PvP 패치': ['PvP 패치', 'PvP patches', 'PvPパッチ', 'แพตช์ PvP', 'PvP补丁', 'PvP補丁'],
    '커뮤니티': ['커뮤니티', 'Community', 'コミュニティ', 'ชุมชน', '社区', '社群'],
    '커뮤니티 홈': ['커뮤니티 홈', 'Community home', 'コミュニティホーム', 'หน้าชุมชน', '社区首页', '社群首頁'],
    '고객센터': ['고객센터', 'Support', 'カスタマーサポート', 'ศูนย์บริการลูกค้า', '客服中心', '客服中心'],
    '로그인': ['로그인', 'Log in', 'ログイン', 'เข้าสู่ระบบ', '登录', '登入'],
    '회원가입': ['회원가입', 'Sign up', '新規登録', 'สมัครสมาชิก', '注册', '註冊'],
    '패치노트': ['패치노트', 'Patch notes', 'パッチノート', 'บันทึกแพตช์', '补丁说明', '補丁說明'],
    '게시판': ['게시판', 'Board', '掲示板', 'กระดานสนทนา', '论坛', '討論區'],
    '게시판 카테고리': ['게시판 카테고리', 'Board categories', '掲示板カテゴリ', 'หมวดหมู่กระดานสนทนา', '论坛分类', '討論區分類'],
    '자유': ['자유', 'Free', '自由', 'เสรี', '自由', '自由'],
    '정보': ['정보', 'Info', '情報', 'ข้อมูล', '信息', '資訊'],
    '질문': ['질문', 'Questions', '質問', 'คำถาม', '问题', '問題'],
    '자랑': ['자랑', 'Showcase', '自慢', 'ผลงาน', '展示', '分享'],
    '글쓰기': ['글쓰기', 'Write', '投稿', 'เขียนโพสต์', '发帖', '發文'],
    '보기 방식': ['보기 방식', 'View mode', '表示方法', 'วิธีแสดงผล', '查看方式', '檢視方式'],
    '카드형': ['카드형', 'Card', 'カード', '卡片', '卡片', '卡片'],
    '목록형': ['목록형', 'List', 'リスト', 'รายการ', '列表', '清單'],
    '최근등록순': ['최근등록순', 'Newest', '新着順', 'ใหม่ล่าสุด', '最新发布', '最新發佈'],
    '좋아요순': ['좋아요순', 'Most liked', 'いいね順', 'ถูกใจมากที่สุด', '点赞最多', '按讚數'],
    '오래된순': ['오래된순', 'Oldest', '古い順', 'เก่าที่สุด', '最早发布', '最早發佈'],
    '이벤트': ['이벤트', 'Events', 'イベント', 'กิจกรรม', '活动', '活動'],
    '이벤트 상태': ['이벤트 상태', 'Event status', 'イベント状態', 'สถานะกิจกรรม', '活动状态', '活動狀態'],
    '설정': ['설정', 'Settings', '設定', 'การตั้งค่า', '设置', '設定'],
    '즐겨찾기': ['즐겨찾기', 'Favorites', 'お気に入り', 'รายการโปรด', '收藏', '收藏'],
    '알림': ['알림', 'Notifications', '通知', 'การแจ้งเตือน', '通知', '通知'],
    '언어 변경': ['언어 변경', 'Change language', '言語変更', 'เปลี่ยนภาษา', '更改语言', '變更語言'],
    '언어 설정': ['언어 설정', 'Language settings', '言語設定', 'การตั้งค่าภาษา', '语言设置', '語言設定'],
    '계정': ['계정', 'Account', 'アカウント', 'บัญชี', '账号', '帳戶'],
    '로그아웃': ['로그아웃', 'Log out', 'ログアウト', 'ออกจากระบบ', '退出登录', '登出'],
    '전체 메뉴 열기': ['전체 메뉴 열기', 'Open menu', 'メニューを開く', 'เปิดเมนู', '打开菜单', '開啟選單'],
    '메뉴 닫기': ['메뉴 닫기', 'Close menu', 'メニューを閉じる', 'ปิดเมนู', '关闭菜单', '關閉選單'],
    '바로가기': ['바로가기', 'Open', '移動', 'เปิด', '前往', '前往'],
    '캐릭터 검색': ['캐릭터 검색', 'Search characters', 'キャラクターを検索', 'ค้นหาตัวละคร', '搜索角色', '搜尋角色'],
    '검색': ['검색', 'Search', '検索', 'ค้นหา', '搜索', '搜尋'],
    '새로고침': ['새로고침', 'Refresh', '更新', 'รีเฟรช', '刷新', '重新整理'],
    '필터 새로고침': ['필터 새로고침', 'Refresh filters', 'フィルターを更新', 'รีเฟรชตัวกรอง', '刷新筛选', '重新整理篩選'],
    '즐겨찾기한 캐릭터 없음': ['즐겨찾기한 캐릭터 없음', 'No favorite characters', 'お気に入りのキャラクターはありません', 'ไม่มีตัวละครโปรด', '没有收藏的角色', '沒有收藏的角色'],
    '추가해보세요': ['추가해보세요', 'Add one to get started', '追加してみましょう', 'ลองเพิ่มดู', '添加一个试试', '試著新增一個'],
    '캐릭터 페이지로': ['캐릭터 페이지로', 'Go to characters', 'キャラクターページへ', 'ไปหน้าตัวละคร', '前往角色页面', '前往角色頁面'],
    '등급 필터': ['등급 필터', 'Grade filter', '等級フィルター', 'ตัวกรองระดับ', '等级筛选', '等級篩選'],
    '속성 필터': ['속성 필터', 'Attribute filter', '属性フィルター', 'ตัวกรองคุณสมบัติ', '属性筛选', '屬性篩選'],
    '타입 필터': ['타입 필터', 'Type filter', 'タイプフィルター', 'ตัวกรองประเภท', '类型筛选', '類型篩選'],
    '정렬': ['정렬', 'Sort', '並べ替え', 'จัดเรียง', '排序', '排序'],
    '전체': ['전체', 'All', 'すべて', 'ทั้งหมด', '全部', '全部'],
    '힘': ['힘', 'Power', '力', 'พลัง', '力', '力'],
    '기': ['기', 'Skill', '技', 'ทักษะ', '技', '技'],
    '심': ['심', 'Mind', '心', 'จิตใจ', '心', '心'],
    '버프': ['버프', 'Buff', 'バフ', 'บัฟ', '增益', '增益'],
    '너프': ['너프', 'Nerf', 'ナーフ', 'เนิร์ฟ', '削弱', '削弱'],
    '기능수정': ['기능수정', 'Fixes', '機能修正', 'แก้ไขฟังก์ชัน', '功能修复', '功能修正'],
    '진행중': ['진행중', 'In progress', '開催中', 'กำลังดำเนินการ', '进行中', '進行中'],
    '종료됨': ['종료됨', 'Ended', '終了', 'สิ้นสุดแล้ว', '已结束', '已結束'],
    '월별': ['월별', 'By month', '月別', 'รายเดือน', '按月份', '按月份'],
    '월별 선택': ['월별 선택', 'Select month', '月を選択', 'เลือกเดือน', '选择月份', '選擇月份'],
    '이전 페이지': ['이전 페이지', 'Previous page', '前のページ', 'หน้าก่อนหน้า', '上一页', '上一頁'],
    '다음 페이지': ['다음 페이지', 'Next page', '次のページ', 'หน้าถัดไป', '下一页', '下一頁'],
    '목록으로': ['목록으로', 'Back to list', '一覧へ', 'กลับไปที่รายการ', '返回列表', '返回列表'],
    '조회수': ['조회수', 'Views', '閲覧数', 'จำนวนการดู', '浏览量', '瀏覽量'],
    '좋아요': ['좋아요', 'Likes', 'いいね', 'ถูกใจ', '点赞', '讚'],
    '댓글': ['댓글', 'Comments', 'コメント', 'ความคิดเห็น', '评论', '留言'],
    '공지': ['공지', 'Notice', 'お知らせ', 'ประกาศ', '公告', '公告'],
    '공지사항': ['공지사항', 'Notices', 'お知らせ', 'ประกาศ', '公告', '公告'],
    '알림 설정': ['알림 설정', 'Notification settings', '通知設定', 'การตั้งค่าการแจ้งเตือน', '通知设置', '通知設定'],
    '테마 변경': ['테마 변경', 'Change theme', 'テーマ変更', 'เปลี่ยนธีม', '更改主题', '變更主題'],
    '테마 설정': ['테마 설정', 'Theme settings', 'テーマ設定', 'การตั้งค่าธีม', '主题设置', '主題設定'],
    '라이트 모드': ['라이트 모드', 'Light mode', 'ライトモード', 'โหมดสว่าง', '浅色模式', '淺色模式'],
    '다크 모드': ['다크 모드', 'Dark mode', 'ダークモード', 'โหมดมืด', '深色模式', '深色模式'],
    '앱 아이콘 변경': ['앱 아이콘 변경', 'Change app icon', 'アプリアイコンを変更', 'เปลี่ยนไอคอนแอป', '更改应用图标', '變更應用程式圖示'],
    '정보 설정': ['정보 설정', 'Profile settings', 'プロフィール設定', 'การตั้งค่าโปรไฟล์', '个人资料设置', '個人資料設定'],
    '프로필 정보': ['프로필 정보', 'Profile', 'プロフィール情報', 'ข้อมูลโปรไฟล์', '个人资料', '個人資料'],
    '내 정보': ['내 정보', 'My information', '自分の情報', 'ข้อมูลของฉัน', '我的信息', '我的資訊'],
    '저장': ['저장', 'Save', '保存', 'บันทึก', '保存', '儲存'],
    '닫기': ['닫기', 'Close', '閉じる', 'ปิด', '关闭', '關閉'],
    '취소': ['취소', 'Cancel', 'キャンセル', 'ยกเลิก', '取消', '取消'],
    '등록': ['등록', 'Add', '登録', 'เพิ่ม', '添加', '新增'],
    '로그인 후 이용할 수 있습니다.': ['로그인 후 이용할 수 있습니다.', 'Please log in to continue.', 'ログイン後にご利用いただけます。', 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ', '请登录后继续。', '請登入後繼續。'],
    '등록된 패치노트가 없습니다.': ['등록된 패치노트가 없습니다.', 'No patch notes have been posted.', '登録されたパッチノートはありません。', 'ยังไม่มีบันทึกแพตช์', '暂无补丁说明。', '尚無補丁說明。'],
    '게시글이 없습니다.': ['게시글이 없습니다.', 'No posts yet.', '投稿はありません。', 'ยังไม่มีโพสต์', '暂无帖子。', '尚無貼文。'],
    '진행 중인 이벤트가 없습니다.': ['진행 중인 이벤트가 없습니다.', 'No active events.', '開催中のイベントはありません。', 'ไม่มีกิจกรรมที่กำลังดำเนินการ', '暂无进行中的活动。', '目前沒有進行中的活動。'],
    '새로운 이벤트가 시작되면 이곳에 표시됩니다.': ['새로운 이벤트가 시작되면 이곳에 표시됩니다.', 'New events will appear here.', '新しいイベントが始まるとここに表示されます。', 'กิจกรรมใหม่จะแสดงที่นี่', '新活动开始后会显示在这里。', '新活動開始後會顯示在這裡。'],
    '패치노트를 찾을 수 없습니다.': ['패치노트를 찾을 수 없습니다.', 'Patch note not found.', 'パッチノートが見つかりません。', 'ไม่พบบันทึกแพตช์', '找不到补丁说明。', '找不到補丁說明。'],
    '데이터를 불러오지 못했습니다.': ['데이터를 불러오지 못했습니다.', 'Unable to load data.', 'データを読み込めませんでした。', 'โหลดข้อมูลไม่สำเร็จ', '无法加载数据。', '無法載入資料。'],
    '고객센터는 1:1 문의와 자주하는 질문만 지원합니다.': ['고객센터는 1:1 문의와 자주하는 질문만 지원합니다.', 'Support provides 1:1 inquiries and frequently asked questions.', 'カスタマーサポートではお問い合わせとFAQをご利用いただけます。', 'ศูนย์บริการรองรับการสอบถามและคำถามที่พบบ่อย', '客服中心提供一对一咨询和常见问题。', '客服中心提供一對一諮詢與常見問題。'],
    '공지사항은 커뮤니티 페이지를 이용해 주세요.': ['공지사항은 커뮤니티 페이지를 이용해 주세요.', 'Please use the community page for notices.', 'お知らせはコミュニティページをご利用ください。', 'โปรดดูประกาศที่หน้าชุมชน', '公告请前往社区页面查看。', '公告請前往社群頁面查看。'],
    '1:1 문의': ['1:1 문의', '1:1 inquiry', 'お問い合わせ', 'สอบถามแบบ 1:1', '一对一咨询', '一對一諮詢'],
    '문의 제목': ['문의 제목', 'Inquiry title', 'お問い合わせの件名', 'หัวข้อการสอบถาม', '咨询标题', '諮詢標題'],
    '문의 내용을 자세히 남겨주세요.': ['문의 내용을 자세히 남겨주세요.', 'Please describe your inquiry in detail.', 'お問い合わせ内容を詳しく入力してください。', 'กรุณาระบุรายละเอียดการสอบถาม', '请详细填写咨询内容。', '請詳細填寫諮詢內容。'],
    '문의 접수하기': ['문의 접수하기', 'Submit inquiry', 'お問い合わせを送信', 'ส่งคำถาม', '提交咨询', '提交諮詢'],
    '문의가 접수되었습니다. 감사합니다!': ['문의가 접수되었습니다. 감사합니다!', 'Your inquiry has been submitted. Thank you!', 'お問い合わせを受け付けました。ありがとうございます！', 'ส่งคำถามเรียบร้อยแล้ว ขอบคุณ!', '咨询已提交，谢谢！', '諮詢已提交，謝謝！'],
    '나의 문의': ['나의 문의', 'My inquiries', 'お問い合わせ履歴', 'คำถามของฉัน', '我的咨询', '我的諮詢'],
    '접수한 문의가 없습니다.': ['접수한 문의가 없습니다.', 'No inquiries found.', 'お問い合わせ履歴はありません。', 'ไม่มีประวัติการสอบถาม', '暂无咨询记录。', '沒有諮詢紀錄。'],
    '뒤로가기': ['뒤로가기', 'Back', '戻る', 'ย้อนกลับ', '返回', '返回'],
    '가입하기': ['가입하기', 'Sign up', '登録する', 'สมัครสมาชิก', '注册', '註冊'],
    '이메일로 시작': ['이메일로 시작', 'Start with email', 'メールアドレスで始める', 'เริ่มด้วยอีเมล', '使用邮箱开始', '使用電子郵件開始'],
    '또는': ['또는', 'or', 'または', 'หรือ', '或', '或'],
    '비밀번호': ['비밀번호', 'Password', 'パスワード', 'รหัสผ่าน', '密码', '密碼'],
    '닉네임': ['닉네임', 'Nickname', 'ニックネーム', 'ชื่อเล่น', '昵称', '暱稱'],
    '이미 계정이 있으신가요? 로그인': ['이미 계정이 있으신가요? 로그인', 'Already have an account? Log in', 'アカウントをお持ちですか？ログイン', 'มีบัญชีอยู่แล้วหรือไม่? เข้าสู่ระบบ', '已有账号？登录', '已有帳戶？登入'],
    '확인': ['확인', 'Confirm', '確認', 'ยืนยัน', '确定', '確認'],
    '필수 입력 항목입니다.': ['필수 입력 항목입니다.', 'This field is required.', '必須入力項目です。', 'กรุณากรอกข้อมูลนี้', '此项为必填项。', '此欄為必填項。']
  };

  var INDEX = {};
  /* 기존 번역표 배열의 슬롯 순서를 보존하되, 사이트 선택 메뉴에는 5개 언어만 노출한다. */
  var LANG_INDEX = { ko: 0, en: 1, ja: 2, 'zh-cn': 4, 'zh-tw': 5 };
  Object.keys(P).forEach(function (key) {
    INDEX[key] = P[key];
  });

  function validLanguage(code) {
    code = String(code || '').toLowerCase();
    return LANGS.indexOf(code) > -1 ? code : 'ko';
  }

  function pathInfo() {
    var m = location.pathname.match(/\/(ko|en|ja|zh-cn|zh-tw)\/([^/]+\.html)$/i);
    return { lang: m ? validLanguage(m[1]) : 'ko', file: m ? m[2] : (location.pathname.split('/').pop() || 'Main.html'), localized: !!m };
  }

  var info = pathInfo();
  var current = info.lang;
  var translating = false;

  function storedLanguage() {
    try {
      var saved = localStorage.getItem('fpp_language');
      return LANGS.indexOf(saved) > -1 ? saved : '';
    } catch (e) {
      return '';
    }
  }

  function get(key, fallback) {
    var row = INDEX[key];
    if (row) {
      var idx = LANG_INDEX[current];
      return row[idx] || row[0];
    }
    return fallback == null ? key : fallback;
  }

  function preserveWhitespace(original, value) {
    var lead = (original.match(/^\s*/) || [''])[0];
    var tail = (original.match(/\s*$/) || [''])[0];
    return lead + value + (tail && tail.length > lead.length ? tail : '');
  }

  function translateText(text) {
    if (!text || current === 'ko') return text;
    var trimmed = text.trim();
    if (!trimmed) return text;
    if (INDEX[trimmed]) return preserveWhitespace(text, get(trimmed));
    var result = text;
    Object.keys(INDEX).sort(function (a, b) { return b.length - a.length; }).forEach(function (key) {
      if (result.indexOf(key) > -1) result = result.split(key).join(get(key));
    });
    return result;
  }

  function translateElement(el) {
    if (!el || el.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(el.tagName)) return;
    var nodes = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = node.parentElement;
        return p && !/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(p.tagName) ?
          NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var value = translateText(node.nodeValue);
      if (value !== node.nodeValue) node.nodeValue = value;
    });
    ['aria-label', 'title', 'placeholder', 'alt'].forEach(function (attr) {
      if (el.hasAttribute && el.hasAttribute(attr)) {
        var value = el.getAttribute(attr);
        var translated = translateText(value);
        if (translated !== value) el.setAttribute(attr, translated);
      }
    });
  }

  function localizedHref(href) {
    if (!href || /^(?:[a-z]+:|\/\/|#|data:|mailto:|tel:)/i.test(href)) return href;
    var hash = '';
    var query = '';
    var bare = href;
    var hi = bare.indexOf('#');
    if (hi > -1) { hash = bare.slice(hi); bare = bare.slice(0, hi); }
    var qi = bare.indexOf('?');
    if (qi > -1) { query = bare.slice(qi); bare = bare.slice(0, qi); }
    if (!/\.html$/i.test(bare)) return href;
    var file = bare.split('/').pop();
    if (LANGS.some(function (l) { return bare.split('/').indexOf(l) > -1; })) return href;
    var base = location.pathname.replace(/[^/]*$/, '');
    if (info.localized) base = base.replace(/(ko|en|ja|zh-cn|zh-tw)\/$/i, '');
    return base + current + '/' + file + query + hash;
  }

  function rewriteLinks(rootEl) {
    if (!rootEl || !rootEl.querySelectorAll) return;
    rootEl.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      var next = localizedHref(href);
      if (next !== href) a.setAttribute('href', next);
    });
  }

  function apply(rootEl) {
    if (!rootEl) return;
    translating = true;
    document.documentElement.setAttribute('lang', current);
    translateElement(rootEl);
    rewriteLinks(rootEl);
    var title = get('FPP v2 — 원피스 파이팅패스 커뮤니티', document.title);
    if (document.title) document.title = translateText(document.title);
    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', translateText(description.getAttribute('content')));
    translating = false;
  }

  function languageHref(code) {
    code = validLanguage(code);
    var base = location.pathname.replace(/[^/]*$/, '');
    if (info.localized) base = base.replace(/(ko|en|ja|zh-cn|zh-tw)\/$/i, '');
    return base + code + '/' + info.file + location.search + location.hash;
  }

  function setLanguage(code) {
    code = validLanguage(code);
    try { localStorage.setItem('fpp_language', code); } catch (e) { }
    if (code === current && info.localized) return;
    location.href = languageHref(code);
  }

  function loadPack() {
    /* 첨부된 <line=n> 형식의 언어팩도 함께 읽어 둔다. */
    var url = new URL('lang/' + current + '.txt', document.baseURI).href;
    fetch(url).then(function (r) { return r.ok ? r.text() : ''; }).then(function (text) {
      var pack = {};
      String(text || '').split(/\r?\n/).forEach(function (line) {
        var m = line.match(/^<line=(\d+)>([\s\S]*)<\/line>$/);
        if (m) pack[m[1]] = m[2];
      });
      root.FPP_LANGUAGE_PACK = pack;
    }).catch(function () { root.FPP_LANGUAGE_PACK = {}; });
  }

  root.I18N = {
    langs: LANGS.slice(),
    names: NAMES,
    get: get,
    t: get,
    current: function () { return current; },
    isLocalized: function () { return info.localized; },
    translateText: translateText,
    apply: apply,
    localizedHref: localizedHref,
    languageHref: languageHref,
    setLanguage: setLanguage,
    loadPack: loadPack
  };

  function boot() {
    /* 루트 주소를 새로 열어도 마지막으로 선택한 언어 경로로 복귀한다. */
    var saved = storedLanguage();
    if (!info.localized && saved) {
      location.replace(languageHref(saved));
      return;
    }
    apply(document.body || document.documentElement);
    loadPack();
    if (!root.MutationObserver) return;
    var observer = new MutationObserver(function (records) {
      if (translating) return;
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) apply(node);
          else if (node.nodeType === 3) {
            var value = translateText(node.nodeValue);
            if (value !== node.nodeValue) {
              translating = true;
              node.nodeValue = value;
              translating = false;
            }
          }
        });
      });
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);