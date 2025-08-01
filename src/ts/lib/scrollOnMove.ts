import $ from 'jquery';
import raf from 'raf';

const BORDER = 100;

class ScrollOnMove {
	
	timeout = 0;
	viewportWidth = 0;
	viewportHeight = 0;
	documentWidth = 0;
	documentHeight = 0;
	param: any = {};
	frame = 0;

	/**
	 * Handles mouse down event and sets up viewport/document dimensions.
	 * @param {any} e - The mouse event.
	 * @param {Object} param - Parameters for the scroll.
	 */
	onMouseDown (e: any, param: { isWindow?: boolean, container?: JQuery }) {
		param = param || {};
		this.param = param;

		const { isWindow, container } = param;

		if (!isWindow) {
			const content = container.find('> .content');

			this.viewportWidth = container.width();
			this.viewportHeight = container.height();
			this.documentWidth = content.width();
			this.documentHeight = content.height();
		} else {
			this.viewportWidth = document.documentElement.clientWidth;
			this.viewportHeight = document.documentElement.clientHeight;

			this.documentWidth = Math.max(
				document.body.scrollWidth,
				document.body.offsetWidth,
				document.body.clientWidth,
				document.documentElement.scrollWidth,
				document.documentElement.offsetWidth,
				document.documentElement.clientWidth
			);
			
			this.documentHeight = Math.max(
				document.body.scrollHeight,
				document.body.offsetHeight,
				document.body.clientHeight,
				document.documentElement.scrollHeight,
				document.documentElement.offsetHeight,
				document.documentElement.clientHeight
			);
		};
	};

	/**
	 * Starts checking for window scroll based on mouse position.
	 * @param {any} param - Scroll parameters.
	 */
	checkForWindowScroll (param: any) {
		this.clear();
		this.frame = raf(() => {
			if (this.adjustWindowScroll(param)) {
				this.checkForWindowScroll(param);
			};
		});
	};

	/**
	 * Adjusts window scroll if mouse is near the edge.
	 * @param {any} param - Scroll parameters.
	 * @returns {boolean} True if scroll was adjusted.
	 */
	adjustWindowScroll (param: any) {
		const { 
			viewportX, viewportY,
			isInLeftEdge, isInRightEdge, isInTopEdge, isInBottomEdge, 
			edgeLeft, edgeRight, edgeTop, edgeBottom, 
		} = param;
		const { isWindow, container } = this.param;

		const maxScrollX = this.documentWidth - this.viewportWidth; 
		const maxScrollY = this.documentHeight - this.viewportHeight;

		let currentScrollX = 0;
		let currentScrollY = 0;

		if (!isWindow) {
			currentScrollX = container.scrollLeft();
			currentScrollY = container.scrollTop();
		} else {
			currentScrollX = window.pageXOffset;
			currentScrollY = window.pageYOffset;
		};

		const canScrollUp = (currentScrollY > 0);
		const canScrollDown = (currentScrollY < maxScrollY);
		const canScrollLeft = (currentScrollX > 0);
		const canScrollRight = (currentScrollX < maxScrollX);
		const maxStep = 10;

		let nextScrollX = currentScrollX;
		let nextScrollY = currentScrollY;
		let intensity = 0;

		if (isInLeftEdge && canScrollLeft) {
			intensity = (edgeLeft - viewportX) / BORDER;
			nextScrollX = nextScrollX - maxStep * intensity;
		} else 
		if (isInRightEdge && canScrollRight) {
			intensity = (viewportX - edgeRight) / BORDER;
			nextScrollX = nextScrollX + maxStep * intensity;
		};

		if (isInTopEdge && canScrollUp) {
			intensity = (edgeTop - viewportY) / BORDER;
			nextScrollY = nextScrollY - maxStep * intensity;
		} else 
		if (isInBottomEdge && canScrollDown) {
			intensity = (viewportY - edgeBottom) / BORDER;
			nextScrollY = nextScrollY + maxStep * intensity;
		};

		nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));
		nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

		// Disable move on X
		nextScrollX = currentScrollX;

		if (
			(nextScrollX !== currentScrollX) ||
			(nextScrollY !== currentScrollY)
		) {
			if (container.length) {
				container.scrollLeft(nextScrollX);
				container.scrollTop(nextScrollY);
			};
			return true;
		} else {
			return false;
		};
	};
	
	/**
	 * Handles mouse move event and triggers auto-scroll if near edge.
	 * @param {number} x - Mouse X position.
	 * @param {number} y - Mouse Y position.
	 */
	onMouseMove (x: number, y: number) {
		const edgeTop = BORDER;
		const edgeLeft = BORDER;
		const edgeBottom = this.viewportHeight - BORDER;
		const edgeRight = this.viewportWidth - BORDER;

		const isInLeftEdge = (x > 0) && (x < edgeLeft);
		const isInRightEdge = x > edgeRight;
		const isInTopEdge = (y > 0) && (y < edgeTop);
		const isInBottomEdge = y > edgeBottom;

		if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
			this.clear();
			return;
		};
	
		this.checkForWindowScroll({
			viewportX:		 x, 
			viewportY:		 y,
			isInLeftEdge:	 isInLeftEdge, 
			isInRightEdge:	 isInRightEdge, 
			isInTopEdge:	 isInTopEdge, 
			isInBottomEdge:	 isInBottomEdge, 
			edgeLeft:		 edgeLeft, 
			edgeRight:		 edgeRight, 
			edgeTop:		 edgeTop, 
			edgeBottom:		 edgeBottom, 
		});
	};
	
	/**
	 * Handles mouse up event and clears any ongoing scroll.
	 * @param {any} e - The mouse event.
	 */
	onMouseUp (e: any) {
		this.clear();
	};

	/**
	 * Clears any ongoing scroll animation frame.
	 */
	clear () {
		if (this.frame) {
			raf.cancel(this.frame);
		};
	};
	
};

 export const scrollOnMove: ScrollOnMove = new ScrollOnMove();