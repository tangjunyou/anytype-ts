import * as React from 'react';
import { observer } from 'mobx-react';
import $ from 'jquery';
import raf from 'raf';
import { Dimmer, Icon, Title } from 'Component';
import { I, S, U, J, keyboard, analytics, Storage } from 'Lib';

import MenuHelp from './help';
import MenuOnboarding from './onboarding';
import MenuParticipant from './participant';
import MenuPublish from './publish';
import MenuTableOfContents from './tableOfContents';

import MenuSelect from './select';
import MenuButton from './button';

import MenuSmile from './smile';
import MenuSmileSkin from './smile/skin';
import MenuSmileColor from './smile/color';

import MenuCalendar from './calendar';
import MenuCalendarDay from './calendar/day';

import MenuObjectContext from './object/context';

import MenuSearchText from './search/text';
import MenuSearchObject from './search/object';

import MenuPreviewObject from './preview/object';
import MenuPreviewLatex from './preview/latex';

import MenuBlockContext from './block/context';
import MenuBlockStyle from './block/style';
import MenuBlockAdd from './block/add';
import MenuBlockColor from './block/color';
import MenuBlockBackground from './block/background';
import MenuBlockCover from './block/cover';
import MenuBlockAction from './block/action';
import MenuBlockHAlign from './block/align';
import MenuBlockLink from './block/link';
import MenuBlockMention from './block/mention';
import MenuBlockLayout from './block/layout';
import MenuBlockLatex from './block/latex';
import MenuBlockLinkSettings from './block/link/settings';

import MenuBlockRelationEdit from './block/relation/edit';

import MenuRelationSuggest from './relation/suggest';
import MenuTypeSuggest from './type/suggest';

import MenuGraphSettings from './graph/settings';
import MenuWidget from './widget';
import MenuObject from './object';

import MenuDataviewRelationList from './dataview/relation/list';
import MenuDataviewRelationEdit from './dataview/relation/edit';
import MenuDataviewGroupList from './dataview/group/list';
import MenuDataviewGroupEdit from './dataview/group/edit';
import MenuDataviewObjectList from './dataview/object/list';
import MenuDataviewObjectValues from './dataview/object/values';
import MenuDataviewFileList from './dataview/file/list';
import MenuDataviewFileValues from './dataview/file/values';
import MenuDataviewFilterList from './dataview/filter/list';
import MenuDataviewFilterValues from './dataview/filter/values';
import MenuDataviewSort from './dataview/sort';
import MenuDataviewViewList from './dataview/view/list';
import MenuDataviewViewSettings from './dataview/view/settings';
import MenuDataviewViewLayout from './dataview/view/layout';
import MenuDataviewOptionList from './dataview/option/list';
import MenuDataviewOptionEdit from './dataview/option/edit';
import MenuDataviewText from './dataview/text';
import MenuDataviewSource from './dataview/source';
import MenuDataviewCreateBookmark from './dataview/create/bookmark';
import MenuDataviewTemplateContext from './dataview/template/context';
import MenuDataviewTemplateList from './dataview/template/list';
import MenuDataviewNew from './dataview/new';

import MenuSyncStatus from './syncStatus';
import MenuSyncStatusInfo from './syncStatus/info';

import MenuIdentity from './identity';

interface State {
	tab: string;
};

const ARROW_WIDTH = 17;
const ARROW_HEIGHT = 8;

const Components: any = {

	help:					 MenuHelp,
	onboarding:				 MenuOnboarding,
	participant:			 MenuParticipant,
	publish:				 MenuPublish,
	tableOfContents:		 MenuTableOfContents,

	select:					 MenuSelect,
	button:					 MenuButton,

	smile:					 MenuSmile,
	smileSkin:				 MenuSmileSkin,
	smileColor:				 MenuSmileColor,

	calendar:				 MenuCalendar,
	calendarDay:			 MenuCalendarDay,

	objectContext:			 MenuObjectContext,

	searchText:				 MenuSearchText,
	searchObject:			 MenuSearchObject,

	previewObject:			 MenuPreviewObject,
	previewLatex:			 MenuPreviewLatex,
	
	blockContext:			 MenuBlockContext,
	blockAction:			 MenuBlockAction,
	blockStyle:				 MenuBlockStyle,
	blockAdd:				 MenuBlockAdd,
	blockColor:				 MenuBlockColor,
	blockBackground:		 MenuBlockBackground,
	blockAlign:				 MenuBlockHAlign,
	blockLink:				 MenuBlockLink,
	blockCover:				 MenuBlockCover,
	blockMention:			 MenuBlockMention,
	blockLayout:			 MenuBlockLayout,
	blockLatex:				 MenuBlockLatex,
	blockLinkSettings:		 MenuBlockLinkSettings,

	blockRelationEdit:		 MenuBlockRelationEdit,

	relationSuggest:		 MenuRelationSuggest,
	typeSuggest:			 MenuTypeSuggest,

	graphSettings:			 MenuGraphSettings,
	widget:					 MenuWidget,
	object:					 MenuObject,

	dataviewRelationList:	 MenuDataviewRelationList,
	dataviewRelationEdit:	 MenuDataviewRelationEdit,
	dataviewGroupList:		 MenuDataviewGroupList,
	dataviewGroupEdit:		 MenuDataviewGroupEdit,
	dataviewObjectList:		 MenuDataviewObjectList,
	dataviewObjectValues:	 MenuDataviewObjectValues,
	dataviewFileList:		 MenuDataviewFileList,
	dataviewFileValues:		 MenuDataviewFileValues,
	dataviewOptionList:		 MenuDataviewOptionList,
	dataviewOptionEdit:		 MenuDataviewOptionEdit,
	dataviewFilterList:		 MenuDataviewFilterList,
	dataviewFilterValues:	 MenuDataviewFilterValues,
	dataviewSort:			 MenuDataviewSort,
	dataviewViewList:		 MenuDataviewViewList,
	dataviewViewSettings:	 MenuDataviewViewSettings,
	dataviewViewLayout:	 	 MenuDataviewViewLayout,
	dataviewText:			 MenuDataviewText,
	dataviewSource:			 MenuDataviewSource,
	dataviewCreateBookmark:	 MenuDataviewCreateBookmark,
	dataviewTemplateContext: MenuDataviewTemplateContext,
	dataviewTemplateList:	 MenuDataviewTemplateList,
	dataviewNew: 		 	 MenuDataviewNew,

	syncStatus:				 MenuSyncStatus,
	syncStatusInfo:			 MenuSyncStatusInfo,

	identity:				 MenuIdentity,
};

const Menu = observer(class Menu extends React.Component<I.Menu, State> {

	_isMounted = false;
	node: any = null;
	timeoutPoly = 0;
	ref = null;
	isAnimating = false;
	poly: any = null;

	state = {
		tab: '',
	};
	
	constructor (props: I.Menu) {
		super(props);
		
		this.position = this.position.bind(this);
		this.close = this.close.bind(this);
		this.setHover = this.setHover.bind(this);
		this.setActive = this.setActive.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.storageGet = this.storageGet.bind(this);
		this.storageSet = this.storageSet.bind(this);
		this.getId = this.getId.bind(this);
		this.getSize = this.getSize.bind(this);
		this.getPosition = this.getPosition.bind(this);
		this.getMaxHeight = this.getMaxHeight.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onDimmerClick = this.onDimmerClick.bind(this);
	};

	render () {
		const { id, param } = this.props;
		const { element, type, vertical, horizontal, passThrough, noDimmer, component, withArrow, getTabs, withBack, onBack } = param;
		const { data } = param;
		const tabs: I.MenuTab[] = getTabs ? getTabs() : [];
		const menuId = this.getId();
		const arrowDirection = this.getArrowDirection();
		const cn = [
			'menu',
			(type == I.MenuType.Horizontal ? 'horizontal' : 'vertical'),
			'v' + vertical,
			'h' + horizontal
		];
		const cd = [];
		
		let tab = '';
		let title = '';
		let Component = null;

		if (tabs.length) {
			tab = this.state.tab || tabs[0].id;
		};

		if (param.title) {
			title = param.title;
		};

		if (component) {
			cn.push(U.Common.toCamelCase('menu-' + component));
		} else {
			cn.push(menuId);
		};

		if (tab) {
			const item = tabs.find(it => it.id == tab);
			if (item) {
				Component = Components[item.component];
			};
		} else
		if (component) {
			Component = Components[component];
		} else {
			Component = Components[id];
		};

		if (!Component) {
			return null;
		};
		
		if (param.className) {
			cn.push(param.className);
		};

		if (passThrough) {
			cd.push('passThrough');
		};

		const Tab = (item: any) => (
			<div className={[ 'tab', (item.id == tab ? 'active' : '') ].join(' ')} onClick={e => this.onTab(item.id)}>
				{item.name}
			</div>
		);

		return (
			<div 
				ref={node => this.node = node}
				id={`${menuId}-wrap`} 
				className="menuWrap"
			>
				<div 
					id={menuId} 
					className={cn.join(' ')} 
					onMouseLeave={this.onMouseLeave}
				>
					{tabs.length ? (
						<div className="tabs">
							{tabs.map((item: any, i: number) => (
								<Tab key={i} {...item} />
							))}
						</div>
					) : ''}

					{title ? (
						<div className="titleWrapper">
							{withBack ? <Icon className="arrow back" onClick={() => onBack(id)} /> : ''}
							<Title text={title} />
						</div>
					) : ''}

					<div className="content">
						<Component 
							ref={ref => this.ref = ref}
							{...this.props} 
							setActive={this.setActive}
							setHover={this.setHover}
							onKeyDown={this.onKeyDown}
							storageGet={this.storageGet}
							storageSet={this.storageSet}
							getId={this.getId} 
							getSize={this.getSize}
							getPosition={this.getPosition}
							getMaxHeight={this.getMaxHeight}
							position={this.position} 
							close={this.close}
							/>
					</div>
					
					{withArrow ? <Icon id="arrowDirection" className={[ 'arrowDirection', 'c' + arrowDirection ].join(' ')} /> : ''}
				</div>
				{!noDimmer ? (
					<Dimmer onClick={this.onDimmerClick} className={cd.join(' ')} />
				) : ''}
			</div>
		);
	};
	
	componentDidMount () {
		const { id, param } = this.props;
		const { initialTab, onOpen, noAutoHover } = param;

		this._isMounted = true;
		this.poly = $('#menu-polygon');

		this.setClass();
		this.position();
		this.animate();
		this.rebind();
		this.setActive();
		
		const obj = $(`#${this.getId()}`);
		const el = this.getElement();

		if (!noAutoHover && el && el.length) {
			el.addClass('hover');
		};

		if (param.height) {
			obj.css({ height: param.height });
		};

		if (initialTab) {
			this.onTab(initialTab);
		};

		if (onOpen) {
			onOpen(this);
		};

		analytics.event('menu', { params: { id } });
	};

	componentDidUpdate () {
		const { param } = this.props;
		const { noAnimation } = param;
		const node = $(this.node); 
		const menu = node.find('.menu');

		this.setClass();

		if (noAnimation) {
			menu.addClass('noAnimation');
		};

		menu.addClass('show').css({ transform: 'none' });
		this.position();
	};

	componentWillUnmount () {
		const { param } = this.props;
		const { isSub } = param;
		const el = this.getElement();

		this._isMounted = false;
		this.unbind();

		if (el && el.length) {
			el.removeClass('hover');
		};
		
		if (isSub) {
			this.poly.hide();
			window.clearTimeout(this.timeoutPoly);
		};

		this.rebindPrevious();
	};

	rebindPrevious () {
		const { id, param } = this.props;
		const { data, rebind, parentId } = param;
		const canRebind = parentId ? S.Menu.isOpen(parentId) : true;

		if (this.ref && this.ref.unbind) {
			this.ref.unbind();
		};

		if (!canRebind) {
			return;
		};

		if (rebind) {
			rebind();
		} else
		if (data.rebind) {
			data.rebind();
			console.error(`[Menu].rebindPrevious uses data.rebind in ${id}`);
		};
	};

	setClass () {
		if (!this._isMounted) {
			return;
		};

		const { param } = this.props;
		const { classNameWrap } = param;
		const node = $(this.node);
		const cn = [ 'menuWrap' ];

		if (classNameWrap) {
			cn.push(classNameWrap);	
		};

		if (S.Popup.isOpen()) {
			cn.push('fromPopup');
		};

		node.attr({ class: cn.join(' ') });
	};

	rebind () {
		this.unbind();
		$(window).on(`resize.${this.getId()}`, () => this.position());
	};
	
	unbind () {
		$(window).off(`resize.${this.getId()}`);
	};
	
	animate () {
		if (this.isAnimating) {
			return;
		};

		const { param } = this.props;
		const { noAnimation } = param;
		const menu = $(`#${this.getId()}`);

		if (noAnimation) {
			menu.addClass('noAnimation show').css({ transform: 'none' });
		} else {
			this.isAnimating = true;

			raf(() => {
				if (!this._isMounted) {
					return;
				};
				
				menu.addClass('show');
				window.setTimeout(() => { 
					menu.css({ transform: 'none' }); 
					this.isAnimating = false;
				}, S.Menu.getTimeout());
			});
		};
	};

	getBorderTop () {
		return Number(window.AnytypeGlobalConfig?.menuBorderTop) || J.Size.header;
	};
	
	getBorderBottom () {
		return Number(window.AnytypeGlobalConfig?.menuBorderBottom) || J.Size.menuBorder;
	};

	getBorderLeft (isFixed) {
		return (Number(window.AnytypeGlobalConfig?.menuBorderLeft) || J.Size.menuBorder) + (isFixed ? 0 : J.Size.vault.width);
	};

	position () {
		const { id, param } = this.props;
		const { element, recalcRect, type, vertical, horizontal, fixedX, fixedY, isSub, noFlipX, noFlipY, withArrow, stickToElementEdge } = param;

		if (this.ref && this.ref.beforePosition) {
			this.ref.beforePosition();
		};

		raf(() => {
			if (!this._isMounted) {
				return;
			};

			const win = $(window);
			const node = $(this.node);
			const menu = node.find('.menu');
			const arrow = menu.find('#arrowDirection');
			const isFixed = (menu.css('position') == 'fixed') || (node.css('position') == 'fixed');
			const winSize = U.Common.getWindowDimensions();
			const borderLeft = this.getBorderLeft(isFixed);
			const borderTop = this.getBorderTop();
			const borderBottom = this.getBorderBottom();
			const scrollTop = win.scrollTop();
			const ww = winSize.ww;
			const wh = winSize.wh + (!isFixed ? scrollTop : 0);
			const width = param.width ? param.width : menu.outerWidth();
			const height = menu.outerHeight();

			let offsetX = Number(typeof param.offsetX === 'function' ? param.offsetX() : param.offsetX) || 0;
			let offsetY = Number(typeof param.offsetY === 'function' ? param.offsetY() : param.offsetY) || 0;
			let ew = 0;
			let eh = 0;
			let ox = 0;
			let oy = 0;
			let rect = null;

			if (recalcRect) {
				rect = recalcRect();
			};
			if (!rect) {
				rect = param.rect;
			};

			if (rect) {
				ew = Number(rect.width) || 0;
				eh = Number(rect.height) || 0;
				ox = Number(rect.x) || 0;
				oy = Number(rect.y) || 0;
			} else {
				const el = this.getElement();
				if (!el || !el.length) {
					console.log('[Menu].position', id, 'element not found', element);
					return;
				};

				const { left, top } = el.offset();
				ew = el.outerWidth();
				eh = el.outerHeight();
				ox = left;
				oy = top;
			};

			if (isFixed) {
				oy -= scrollTop;
			};

			let x = ox;
			let y = oy;
			let flipX = false;

			if (stickToElementEdge != I.MenuDirection.None) {
				switch (stickToElementEdge) {
					case I.MenuDirection.Top: offsetY = -eh; break;
					case I.MenuDirection.Bottom: offsetY = eh; break;
					case I.MenuDirection.Left: offsetX = -ew; break;
					case I.MenuDirection.Right: offsetX = ew; break;
				};
			};

			switch (vertical) {
				case I.MenuDirection.Top:
					y = oy - height + offsetY;
					
					// Switch
					if (!noFlipY && (y <= borderTop)) {
						y = oy + eh - offsetY;
					};
					break;

				case I.MenuDirection.Center:
					y = oy - height / 2 + eh / 2 + offsetY;
					break;

				case I.MenuDirection.Bottom:
					y = oy + eh + offsetY;

					// Switch
					if (!noFlipY && (y >= wh - height - borderBottom)) {
						y = oy - height - offsetY;
					};
					break;
			};

			switch (horizontal) {
				case I.MenuDirection.Left:
					x += offsetX;

					// Switch
					if (!noFlipX && (x >= ww - width - J.Size.menuBorder)) {
						x = ox - width;
						flipX = true;
					};
					break;

				case I.MenuDirection.Center:
					x = x + ew / 2 - width / 2 + offsetX;
					break;

				case I.MenuDirection.Right:
					x -= width + offsetX - ew;

					// Switch
					if (!noFlipX && (x <= J.Size.menuBorder)) {
						x = ox + ew;
						flipX = true;
					};
					break;
			};

			x = Math.max(borderLeft, x);
			x = Math.min(ww - width - J.Size.menuBorder, x);

			y = Math.max(borderTop, y);
			y = Math.min(wh - height - borderBottom, y);

			if (undefined !== fixedX) x = fixedX;
			if (undefined !== fixedY) y = fixedY;

			const css: any = { left: x, top: y };
			if (param.width) {
				css.width = param.width;
			};
			menu.css(css);

			if (isSub) {
				const coords = U.Common.objectCopy(keyboard.mouse.page);
				const offset = 8;

				let w = 0;
				let h = 0;
				let left = 0;
				let top = 0;
				let transform = '';
				let clipPath = '';

				if (type == I.MenuType.Vertical) {
					h = height;
					top = y;

					if (flipX || I.MenuDirection.Right) {
						left = x + width;
						w = Math.abs(x + width - coords.x) - offset;
						transform = 'scaleX(-1)';
					} else {
						left = coords.x + offset;
						w = Math.abs(x - coords.x) - offset;
					};

					clipPath = `polygon(0px ${oy - y}px, 0px ${oy - y + eh}px, 100% 100%, 100% 0%)`;
				};

				if (type == I.MenuType.Horizontal) {
					w = width;
					left = x;
					h = Math.abs(y - coords.y) - offset;
					top = y;
					clipPath = `polygon(0 ${height}px, 100% ${height}px, ${ox - x + ew}px 100%, ${ox - x}px 100%)`;
				};

				this.poly.show().css({
					width: w,
					height: h,
					left,
					top,
					clipPath,
					transform,
					position: (isFixed ? 'fixed' : 'absolute'),
					zIndex: 100000,
				});

				window.clearTimeout(this.timeoutPoly);
				this.timeoutPoly = window.setTimeout(() => this.poly.hide(), 500);
			};

			// Arrow positioning

			if (withArrow) {
				const arrowDirection = this.getArrowDirection();
				const size = this.getSize();
				const { width, height } = size;
				const min = 8;
				const css: any = { left: '', right: '', top: '', bottom: '' };

				switch (arrowDirection) {
					case I.MenuDirection.Bottom:
					case I.MenuDirection.Top:

						switch (horizontal) {
							case I.MenuDirection.Left:
								if (ew > width) {
									css.left = width / 2 - ARROW_WIDTH / 2;
								} else {
									css.left = ew / 2 - ARROW_WIDTH / 2;
								};
								css.left = Math.max(min, Math.min(width - min, css.left));
								break;

							case I.MenuDirection.Center:
								if (ew > width) {
									css.left = width / 2 - ARROW_WIDTH / 2;
								} else {
									css.left = ox - x + ew / 2 - ARROW_WIDTH / 2;
								};
								css.left = Math.max(min, Math.min(width - min, css.left));
								break;

							case I.MenuDirection.Right: 
								if (ew > width) {
									css.right = width / 2 - ARROW_WIDTH / 2;
								} else {
									css.right = ew / 2 - ARROW_WIDTH / 2;
								};
								css.right = Math.max(min, Math.min(width - min, css.right));
								break;
						};
						break;
					
					case I.MenuDirection.Left:
					case I.MenuDirection.Right:
						css.top = eh / 2 - ARROW_HEIGHT / 2;
						css.top = Math.max(min, Math.min(height - min, css.top));
						break;
				};

				arrow.css(css);
			};
		});
	};

	close (callBack?: () => void) {
		S.Menu.close(this.props.id, () => {
			window.setTimeout(() => this.rebindPrevious(), S.Menu.getTimeout());

			if (callBack) {
				callBack();
			};
		});
	};

	onDimmerClick () {
		const { param } = this.props;
		const { noClose } = param;

		if (!noClose) {
			this.close();
		};
	};
	
	onMouseLeave (e: any) {
		const { param } = this.props;
		const { isSub } = param;
		
		if (isSub) {
			this.poly.hide();
		};
	};

	getIndex (): number {
		if (!this.ref) {
			return -1;
		};

		return this.ref.getIndex ? this.ref.getIndex() : this.ref.n;
	};

	setIndex (n: number) {
		if (!this.ref) {
			return;
		};

		this.ref.setIndex ? this.ref.setIndex(n) : this.ref.n = n;
	};

	onKeyDown (e: any) {
		if (!this.ref || !this.ref.getItems || keyboard.isComposition) {
			return;
		};

		e.stopPropagation();
		keyboard.disableMouse(true);

		const { param } = this.props;
		const { commonFilter, data } = param;
		const { preventFilter } = data;
		const refInput = this.ref.refFilter || this.ref.refName;
		const shortcutClose = [ 'escape' ];
		const shortcutSelect = [ 'tab', 'enter' ];
		
		let index = this.getIndex();
		let ret = false;

		if (refInput) {
			if (refInput.isFocused && (index < 0)) {
				keyboard.shortcut('arrowleft, arrowright', e, () => ret = true);

				keyboard.shortcut('arrowdown', e, () => {
					refInput.blur();

					this.setIndex(0);
					this.setActive(null, true);

					ret = true;
				});

				if (this.ref && this.ref.onClick && !preventFilter) {	
					keyboard.shortcut(shortcutSelect.join(', '), e, () => {
						e.preventDefault();

						const items = this.ref.getItems();
						const item = items.length ? items[0] : null;

						if (item) {
							item.arrow && this.ref.onOver ? this.ref.onOver(e, item) : this.ref.onClick(e, item);
						};
					});
				};

				keyboard.shortcut('arrowup', e, () => {
					if (!this.ref.getItems) {
						return;
					};

					this.setIndex(this.ref.getItems().length - 1);
					this.setActive(null, true);

					refInput.blur();
					ret = true;
				});
			} else {
				keyboard.shortcut('arrowup', e, () => {
					if (index < 0) {
						refInput.focus();

						this.setIndex(-1);
						this.setActive(null, true);

						ret = true;
					};
				});
			};
		};

		if (ret) {
			return;
		};

		if (!commonFilter && !keyboard.isFocused) {
			shortcutClose.push('arrowleft');
			shortcutSelect.push('arrowright');
		};

		keyboard.shortcut(shortcutClose.join(', '), e, () => {
			e.preventDefault();
			this.close();
		});

		if (!this.ref || !this.ref.getItems) {
			return;
		};

		const items = this.ref.getItems();
		const l = items.length;
		
		index = this.getIndex();

		const item = items[index];
		const onArrow = (dir: number) => {
			index += dir;

			if (index < 0) {
				if ((index == -1) && refInput) {
					index = -1;
					refInput.focus();
				} else {
					index = l - 1;
				};
			};

			if (index > l - 1) {
				index = 0;
			};

			this.setIndex(index);

			const item = items[index];
			if (!item) {
				return;
			};

			if ((item.isDiv || item.isSection || item.isEmpty) && (items.length > 1)) {
				onArrow(dir);
				return;
			};

			this.setActive(null, true, dir);

			if (!item.arrow && this.ref.onOver) {
				this.ref.onOver(e, item);
			};
		};

		keyboard.shortcut('arrowup', e, () => {
			e.preventDefault();
			onArrow(-1);
		});

		keyboard.shortcut('arrowdown', e, () => {
			e.preventDefault();
			onArrow(1);
		});

		if (this.ref && this.ref.onClick) {	
			keyboard.shortcut(shortcutSelect.join(', '), e, () => {
				e.preventDefault();
				if (item) {
					item.arrow && this.ref.onOver ? this.ref.onOver(e, item) : this.ref.onClick(e, item);
				};
			});
		};

		if (this.ref && this.ref.onSortEnd) {
			keyboard.shortcut('shift+arrowup, shift+arrowdown', e, (pressed: string) => {
				e.preventDefault();
				this.onSortMove(pressed.match('arrowup') ? -1 : 1);
			});
		};

		if (!keyboard.isFocused && (!refInput || (refInput && !refInput.isFocused))) {
			if (this.ref && this.ref.onRemove) {
				keyboard.shortcut('backspace', e, () => {
					e.preventDefault();

					this.setIndex(index - 1);
					this.checkIndex();
					this.ref.onRemove(e, item);
					this.setActive(null, true);
				});
			};

			if (this.ref && this.ref.onSwitch) {
				keyboard.shortcut('space', e, () => {
					e.preventDefault();

					this.ref.onSwitch(e, item);
				});
			};
		};
	};

	onSortMove (dir: number) {
		const index = this.getIndex();

		this.setIndex(index + dir);
		this.checkIndex();
		this.ref.onSortEnd({ oldIndex: index, newIndex: index + dir });
	};

	checkIndex () {
		const items = this.ref.getItems();
		
		let index = this.getIndex();
		index = Math.max(0, index);
		index = Math.min(items.length - 1, index);

		this.setIndex(index);
	};

	setActive (item?: any, scroll?: boolean, dir?: number) {
		dir = dir || 1;

		if (!this.ref || !this.ref.getItems) {
			return;
		};

		const refInput = this.ref.refFilter || this.ref.refName;

		let index = this.getIndex();
		if ((index < 0) && refInput) {
			refInput.focus();
		};

		const items = this.ref.getItems();
		if (item && (undefined !== item.id)) {
			index = items.findIndex(it => it.id == item.id);
		};

		let listRef = null;
		if (this.ref.refList) {
			listRef = this.ref.refList;
		} else 
		if (this.ref.getListRef) {
			listRef = this.ref.getListRef();
		};

		if (scroll) {
			if (this.ref.scrollToRow) {
				this.ref.scrollToRow(items, Math.max(0, index));
			} else
			if (listRef) {
				listRef.scrollToRow(Math.max(0, index));
			};
		};

		const next = items[index];
		if (!next) {
			return;
		};

		if (next.isDiv || next.isSection || next.isEmpty) {
			index += dir;
			this.setIndex(index);

			if (items[index]) {
				this.setActive(items[index], scroll);
			};
		} else {
			this.setHover(next, scroll);
		};

		this.setIndex(index);
	};
	
	setHover (item?: any, scroll?: boolean) {
		if (!this._isMounted) {
			return;
		};

		const node = $(this.node);
		const menu = node.find('.menu');
		
		menu.find('.item.hover').removeClass('hover');

		if (!item) {
			return;
		};

		let el = null;
		if (item.itemId) {
			el = menu.find(`#item-${$.escapeSelector(item.itemId)}`);
		};
		if (item.id && (!el || !el.length)) {
			el = menu.find(`#item-${$.escapeSelector(item.id)}`);
		};

		if (!el || !el.length) {
			return;
		};

		el.addClass('hover');

		if (scroll) {
			let scrollWrap = node.find('.scrollWrap');
			if (!scrollWrap.length) {
				scrollWrap = node.find('.content');
			};

			const st = scrollWrap.scrollTop();
			const pt = el.position().top;
			const eh = el.outerHeight();
			const ch = scrollWrap.height();
			const top = Math.max(0, st + pt + eh - J.Size.menuBorder - ch);
			
			scrollWrap.scrollTop(top);
		};
	};

	onTab (tab: string) {
		this.setState({ tab });
	};

	storageGet () {
		return Storage.get(this.getId()) || {};
	};

	storageSet (data: any) {
		const current = this.storageGet();
		Storage.set(this.getId(), Object.assign(current, data));
	};

	getId (): string {
		const { param } = this.props;
		const { getTabs } = param;
		const { tab } = this.state;
		const tabs = getTabs ? getTabs() : [];

		let id = '';

		if (tab) {
			const item = tabs.find(it => it.id == tab);
			if (item) {
				id = item.component;
			};
		} else {
			id = this.props.id;
		};

		return U.Common.toCamelCase('menu-' + id);
	};

	getElement () {
		return $(this.props.param.element).first();
	};

	getSize (): { width: number; height: number; } {
		const obj = $(`#${this.getId()}`);
		return { width: obj.outerWidth(), height: obj.outerHeight() };
	};

	getPosition (): DOMRect {
		const obj = $(`#${this.getId()}`);
		return obj.length ? obj.get(0).getBoundingClientRect() as DOMRect : null;
	};

	getArrowDirection (): I.MenuDirection {
		const { param } = this.props;
		const { vertical, horizontal } = param;

		let dir: I.MenuDirection = I.MenuDirection.None;

		if (vertical == I.MenuDirection.Bottom) {
			dir = I.MenuDirection.Top;
		};
		if (vertical == I.MenuDirection.Top) {
			dir = I.MenuDirection.Bottom;
		};
		if ((vertical == I.MenuDirection.Center) && (horizontal == I.MenuDirection.Left)) {
			dir = I.MenuDirection.Right;
		};
		if ((vertical == I.MenuDirection.Center) && (horizontal == I.MenuDirection.Right)) {
			dir = I.MenuDirection.Left;
		};

		return dir;
	};

	getMaxHeight (isPopup: boolean): number {
		return U.Common.getScrollContainer(isPopup).height() - this.getBorderTop() - this.getBorderBottom();
	};

});

export default Menu;
