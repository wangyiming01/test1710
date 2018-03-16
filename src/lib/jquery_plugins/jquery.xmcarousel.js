;
(function($){
	function Carousel({imgs, width, height, type, duration, isAutoPlay}) {
		this.imgs = imgs;
		this.len = imgs.length;
		this.width = width;
		this.height = height;
		this.type = type; // 轮播方式：fade-淡入淡出  slide-左右滑动
		this.duration = duration; // 轮播切换时间
		this.container = null; // 轮播容器
		this.ul = null; // 轮播图片LI的父盒子
		this.lis = null; // 所有待轮播的图片盒子
		this.circles = null;
		this.prev = null;
		this.next = null;
		this.currentIndex = 0; // 当前显示图片的索引
		this.nextIndex = 1; // 即将显示图片的索引
		this.isAutoPlay = typeof isAutoPlay === "boolean" ? isAutoPlay : true; // 是否自动轮播
	}

	Carousel.prototype = {
		constructor : Carousel,
		/** 初始化DOM结构
		 * @param container 放置布局DOM结构的父容器
		 */
		init : function(container){
			// 动态创建HTML结构
				this.container = container;
			let content = `
				<!-- 图片 -->
				<ul class="imgs"></ul>
				<!-- 小圆点 -->
				<div class="pages"></div>
				<!-- 向前/后 -->
				<div class="prev">&lt;</div>
				<div class="next">&gt;</div>`;
			// 将布局框架结构加入容器中
			$(container).addClass("xmcarousel").html(content);
			/* 动态添加图片与小圆点的布局 */
			let liHtml = "", iHtml = "";
			for (let i = 0, len = this.imgs.length; i < len; i++) {
				liHtml += `<li><a href="${this.imgs[i].href}"><img src="${this.imgs[i].src}"></a></li>`;
				iHtml += "<i></i>";
			}
			$(".imgs", container).html(liHtml); // 将li添加到ul中
			$(".pages", container).html(iHtml); // 将 i 添加到 div.pages 中
			// 设置各元素CSS样式
			$(container).css({
				width: this.width,
				height: this.height,
				overflow: "hidden"
			});
			// ul样式设置
			this.ul = $(".imgs", container).css({
				width: (this.type === "fade" ? this.width : this.width * this.len),
				height: this.height,
				position: this.type === "fade" ? "relative" : "absolute"
			});
			// 所有 li 样式设置
			this.lis = $(".imgs li", container).css({
				width: this.width,
				height: this.height
			});
			if (this.type === "fade") {
				this.lis.css({
					position: "absolute",
					top: 0,
					left: 0,
					display: "none"
				}).first().show();
			} else {
				this.lis.css({
					float:"left"
				});
			}
			this.circles = $(".pages", container).css({
				width: this.width
			}).children("i");
			this.circles.first().addClass("current");

			this.prev = $(".prev", container);
			this.next = $(".next", container);

			// 判断，调用自动轮播方法
			if (this.isAutoPlay)
				this.autoPlay();
			// 注册事件监听
			this.registerEventListener();
		},
		/**
		 * 自动轮播
		 */ 
		autoPlay : function(){
			this.timer = setInterval(()=>{
				this.move();
			}, this.duration);
		},
		/** 
		 * 切换
		 */
		move : function(){
			if (this.type === "fade") {
				this.fade();
			} else {
				this.slide();
			}
		},
		/** 
		 * 淡入淡出
		 */
		fade : function(){
			// 当前正显示的图片淡出，即将显示的图片淡入
			this.lis.eq(this.currentIndex).fadeOut();
			this.lis.eq(this.nextIndex).fadeIn();
			// 小圆点样式切换
			this.circles.eq(this.currentIndex).removeClass("current");
			this.circles.eq(this.nextIndex).addClass("current");
			// 索引切换
			this.currentIndex = this.nextIndex;
			this.nextIndex++;
			if(this.nextIndex >= this.len)
				this.nextIndex = 0;
		},
		/** 
		 * 滑动
		 */
		slide : function(){
			// 计算滑动定位位置
			var _left = -1 * this.width * this.nextIndex;
			// 运动动画
			this.ul.stop().animate({left: _left});
			// 小圆点样式切换
			this.circles.eq(this.currentIndex).removeClass("current");
			this.circles.eq(this.nextIndex).addClass("current");
			// 索引切换
			this.currentIndex = this.nextIndex;
			this.nextIndex++;
			if(this.nextIndex >= this.len)
				this.nextIndex = 0;
		},
		/**
		 * 注册事件监听
		 */
		registerEventListener : function(){
			// 鼠标移入/出容器
			this.container.hover(() => {
				// mouseenter
				clearInterval(this.timer);
			}, () => {
				// mouseleave
				if (this.isAutoPlay) {
					this.timer = setInterval(()=>{
						this.move();
					}, this.duration)
				}
			});
			// 小圆点移入
			var that = this;
			this.circles.mouseover(function(){
				var index = $(this).index();
				if(that.currentIndex === index)
					return;
				that.nextIndex = index;
				that.move();
			});
			// 向前/后
			this.prev.click(()=>{
				this.nextIndex = this.currentIndex - 1;
				if(this.nextIndex < 0)
					this.nextIndex = this.len - 1;
				this.move();
			});
			this.next.click(()=>{
				this.move();
			});
		}
	};
	// 即该方法可以通过 jQuery 对象的实例来调用   $()
		$.fn.extend({
		carousel : function(options){
			this.each(function(index, element){
				new Carousel(options).init($(element));
			});
		}
	});
}(jQuery));