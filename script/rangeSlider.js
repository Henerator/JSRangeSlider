(function(global) {
				/*						слайдер						*/
	/*
		slider - ссылка на JQuery-объект
	*/
	function range_slider(slider) {
		var self = this;
		
		//	событие изменения выбранного диапозона
		this.rangeChangeEvent = function() {
			$(self).trigger({
				type : 'rangeChange',
				text : slider.attr('text'),
				rangeState : self.getRangeValue()
			});	
		}
		
		//	даипазон и установленные значения
		this.range = {
			rangeMin : slider.attr('rangeMin') || 0,
			rangeMax : slider.attr('rangeMax') || 100,
			valueMin : slider.attr('valueMin') || rangeMin,
			valueMax : slider.attr('valueMax') || rangeMax
		}
		//	длина полосы диапозона
		this.range_width = 0;
		//	цветная линия
		this.color_line = null;
		//	ползунки
		this.left_trigger  = null;
		this.right_trigger = null;
		
		//	активный триггер в режиме перемещения
		this.active_trigger = {
			dragging 	 : false,	//	флаг перемещения
			prevMousePos : 0,		//	предыдущая позиция мыши
			trigger		 : null		//	ссылка на активный ползунок
		}
		
		//	значение ползунка из позиции в пикселях
		this.getValueFromPos = function(pos) {
			var min 	= this.range.rangeMin;
			var max		= this.range.rangeMax;
			var range	= this.range_width;
			
			return (Math.round(pos*((max-min)/range)) + parseInt(min));
		}
		//	позицию ползунка в пикселях их значения
		this.getPosFromValue = function(value) {
			var min 	= this.range.rangeMin;
			var max		= this.range.rangeMax;
			var range	= this.range_width;
			
			return ((value - min)*range)/(max-min);
		}
			
		//	перещемение левого ползунка
		this.moveLeftTrigger = function(x) {
			this.left_trigger.moveTo(x);
		}
		//	перещемение правого ползунка
		this.moveRightTrigger = function(x) {
			this.right_trigger.moveTo(x);
		}
		//	обновление размеров цветной линии между ползунками
		this.updateClrLine = function() {
			self.color_line.css('left', self.left_trigger.getX());
			self.color_line.css('right', self.range_width - self.right_trigger.getX());
		}

		//	получить выбранный диапозон
		this.getRangeValue = function() {
			var rangeValue = {
				min : self.left_trigger.getValue(),
				max : self.right_trigger.getValue()
			}
			
			return rangeValue;
		}
		
		//	события слайдера
		slider.mousemove(function(e) {
			if (self.active_trigger.dragging) {							//	включено перемещение
				var dx = e.clientX - self.active_trigger.prevMousePos;	//	вычисляем смещение мыши
				self.active_trigger.trigger.translate(dx);				//	перемещаем активный ползунок
				self.active_trigger.prevMousePos = e.clientX;			//	обновляем позицию мыши
				self.updateClrLine();									//	обновляем положение цветовой полосы
				
				self.rangeChangeEvent();								//	бросаем событие изменения диапозона
			}
		});
		slider.mouseup(function(e) {
			//	мышь успевает выйти за границы ползунка - отключаем перемещение в событии слайдера
			if (self.active_trigger.dragging) {
				self.active_trigger.dragging = false;							//	выключаем перетаскивание
			}
		});
		slider.mouseleave(function(e) {
			//	при выходе мыши со слайдера останавливаем движение ползунков
			slider.trigger('mouseup');		//	вызываем событие mouseup
		});
		
		//	инициализация
		this.init = function() {
			//	внутренний блок позиционирования триггеров
			var originBlock = $("<div class='slider_origin'></div>");
				//	заголовок
				var caption = $("<div class='slider_caption'></div>");
				//	полоса диапозона
				var range_line = $("<div class='slider_line'></div>");
				//	цветная полоса между ползунками
				var clr_line = $("<div class='slider_clr_line'></div>");
				//	минимальное значение полосы
				var line_min = $("<div class='line_range_value range_line_min'></div>");
				//	максимальное значение полосы
				var line_max = $("<div class='line_range_value range_line_max'></div>");
				
				//	заголовк слайдера
				caption.text(slider.attr('text').toUpperCase());
				
				//	устанавливаем значения
				line_min.text(self.range.rangeMin);
				line_max.text(self.range.rangeMax);
				
				//	присоединяем блоки со значениями к полосе
				range_line.append(line_min);
				range_line.append(line_max);
				range_line.append(clr_line);
				
				//	ползунки
				var left_trigger_div	= $("<div class='slider_trigger'><div class='slider_trigger_value'></div></div>");
				var right_trigger_div	= $("<div class='slider_trigger'><div class='slider_trigger_value'></div></div>");
			
				//	функции проверки на выход за границы для ползунков
				var leftLimitFunc = function(pos) {
					//	выход за левый край и правый ползунок
					if (pos < 0)
						pos = 0;
					if (pos > self.right_trigger.getX())
						pos = self.right_trigger.getX();
						
					return pos;
				}
				var rightLimitFunc = function(pos) {
					//	выход за правый край и левый ползунок
					if (pos > self.range_width)
						pos = self.range_width;
					if (pos < self.left_trigger.getX())
						pos = self.left_trigger.getX();
						
					return pos;
				}
			
				//	создаем обработчики ползунков
				self.left_trigger  = new slider_trigger(self, left_trigger_div, leftLimitFunc);
				self.right_trigger = new slider_trigger(self, right_trigger_div, rightLimitFunc);
				
			//	присоединяем элементы к внутреннему блоку
			originBlock.append(range_line);
			originBlock.append(left_trigger_div);
			originBlock.append(right_trigger_div);
				
			//	добавляем в DOM
			slider.append(caption);
			slider.append(originBlock);
			
			//	сохраняем длину диапозона в пикселях
			self.range_width = slider.width();
			//	ссылка не цветную полосу
			self.color_line = clr_line;
			
			//	начальные значения переводим в пиксели
			var minValuePos = self.getPosFromValue(self.range.valueMin);
			var maxValuePos = self.getPosFromValue(self.range.valueMax);
			
			//	устанавливаем ползунки в начальные положения
			self.moveRightTrigger(maxValuePos);
			self.moveLeftTrigger(minValuePos);
			
			self.updateClrLine();
		}
		
		self.init();
	}

					/*					класс ползунка					*/
	/*
		link_slider 	- ссылка на блок слайдера
		link_trigger	- ссылка на блок триггера
		linitFunk		- функция устанавливающая границы перемещения
	*/
	function slider_trigger(link_slider, link_trigger, limitFunc) {
		var self = this;

		this.slider		= link_slider;
		this.trigger	= link_trigger;
		this.checkLimit = limitFunc;
		this.value		= 0;
		
		//	события
		this.trigger.mousedown(function(e) {
			self.slider.active_trigger.dragging = true;				//	включаем перемещение
			self.slider.active_trigger.prevMousePos = e.clientX;	//	запоминаем позицию мыши
			self.slider.active_trigger.trigger = self;				//	устанавливаем перемещаемый ползунок
		});
		
		//	позиция ползунка
		this.getX = function() {
			return this.trigger.position().left;
		}
		
		//	обновить значение
		this.updateValue = function() {
			var trigger_value = self.slider.getValueFromPos(this.getX());
			self.value = trigger_value;
			
			$(self.trigger).find(".slider_trigger_value").text(trigger_value);
		}
		
		//	получить текущее значение
		this.getValue = function() {
			return self.value;
		}
		
		//	переместить в указанную позицию
		this.moveTo = function(pos) {
			pos = self.checkLimit(pos);			//	проверяем выход за границы
			
			this.trigger.css("left", pos);		//	передвигаем
			this.updateValue();					//	обновляем значения
		}
		
		//	передвинуть на указанное смещение
		this.translate = function(dx) {
			this.moveTo(this.getX() + dx);
		}
	}

	function log(text) {
		console.log(text);
	}

	//	предоставляем доступ к слайдеру из глобального контекста
	this.RangeSlider = range_slider;

})(this);

