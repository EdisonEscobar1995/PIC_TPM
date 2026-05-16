$(function(){
	$('.order').hide();
	$("table select").removeClass("input-small").addClass("input-xsmall");
	$(document).on("input", ".porcentage", function () {
	  this.value = this.value.replace(/[^0-9]/g, "");
	});
	
	if (application.bNuevo) {
		$('.order').closest('td').hide();
		$('.thOrdenInv').closest('td').hide();
		$('.thOrdenAna').closest('td').hide();
		$('.thOrdenInfCom').closest('td').hide();
		
		$(".dInvestigacion .order").each(function (index) {
		  $(this).val(index + 1);
		});
		$(".dAnalisis .order").each(function (index) {
		  $(this).val(index + 1);
		});
		$(".dInfoComple .order").each(function (index) {
		  $(this).val(index + 1);
		});
		$(".dImplementacion .order").each(function (index) {
		  $(this).val(index + 1);
		});
		
		 
	} else {
		// $('.order').show();
		addOrderFields(".dInvestigacion .order");
		addOrderFields(".dAnalisis .order");
		addOrderFields(".dImplementacion .order");
		addOrderFields(".dInfoComple .order");
		orderFields(".dInvestigacion table:nth-of-type(2)");
		ordenarTablasAna();
		orderFields(".dInfoComple table");
	}
	
	$("#general").show();
})

function guardar(){
	document.forms[0].submit();
}

function orderFields(tableSel) {
	var $table = $(tableSel);
    var $tbody = $table.find("tbody").length 
        ? $table.find("tbody") 
        : $table;

    var $rows = $tbody.find("tr");

    // Convertimos a array para poder ordenar
    var rowsArray = $rows.get();

    rowsArray.sort(function (a, b) {
        var orderA = parseInt($(a).find(".order").val(), 10) || 0;
        var orderB = parseInt($(b).find(".order").val(), 10) || 0;
        return orderA - orderB;
    });

    // Reinsertar filas en el nuevo orden
    $.each(rowsArray, function (index, row) {
        $tbody.append(row);
    });
}

function ordenarTablasAna() {
  $('.dAnalisis > div').each(function () {
    var $container = $(this);

    var $tables = $container.children('table').get();

    $tables.sort(function (a, b) {
      var orderA = parseInt($(a).find('.order').val(), 10) || 0;
      var orderB = parseInt($(b).find('.order').val(), 10) || 0;

      return orderA - orderB;
    });

    $.each($tables, function (index, table) {
      $container.append(table);
    });

    // Recalcular orden para dejarlo consistente
    recalcularOrden($container);
  });
}

function recalcularOrden($container) {
  $container.children('table').each(function (index) {
    $(this).find('.order').val(index + 1);
  });
}
function addOrderFieldsOld(selector) {
	$(selector).each(function () {
	  var $controls = $(
	    '<div class="order-controls" style="display:flex; gap:2px;">' +
	      '<button type="button" class="btn btn-success btn-mini btn-up">' +
	        '<i class="icon-arrow-up"></i>' +
	      '</button>' +
	      '<button type="button" class="btn btn-success btn-mini btn-down">' +
	        '<i class="icon-arrow-down"></i>' +
	      '</button>' +
	    '</div>'
	  );

	  // 👇 AQUÍ this SÍ es el input .order
	  $controls.insertAfter(this);
	  
	  if (selector == ".dAnalisis .order") {
		  $controls.find('.btn-up').on('click', function () {
			  moveUpAna(this, selector);
		  });

		  $controls.find('.btn-down').on('click', function () {
			  moveDownAna(this, selector);
		  });
	  } else {
		  $controls.find('.btn-up').on('click', function () {
		    moveUp(this, selector);
		  });

		  $controls.find('.btn-down').on('click', function () {
		    moveDown(this, selector);
		  });
	  }


	});
}

function addOrderFields(selector) {

  $(selector).each(function () {
    var $input = $(this);
    var isAnalisis = $input.closest('.dAnalisis').length > 0;

    var $controls = $(
      '<div class="order-controls" style="display:flex; gap:2px;">' +
        '<button type="button" class="btn btn-success btn-mini btn-up">' +
          '<i class="icon-arrow-up"></i>' +
        '</button>' +
        '<button type="button" class="btn btn-success btn-mini btn-down">' +
          '<i class="icon-arrow-down"></i>' +
        '</button>' +
      '</div>'
    );

    // Insertar controles al lado del input
    $controls.insertAfter($input);

    // Eventos
    $controls.find('.btn-up').on('click', function () {
      if (isAnalisis) {
        moveUpAna(this, selector);
      } else {
        moveUp(this, selector);
      }
    });

    $controls.find('.btn-down').on('click', function () {
      if (isAnalisis) {
        moveDownAna(this, selector);
      } else {
        moveDown(this, selector);
      }
    });

  });
}

function moveUp(btn, selectorUpdate) {
  var row = btn.closest("tr");
  var prev = row.previousElementSibling;
  if (prev) {
    row.parentNode.insertBefore(row, prev);
    updateOrder(selectorUpdate);
  }
}

function moveDown(btn, selectorUpdate) {
  var row = btn.closest("tr");
  var next = row.nextElementSibling;
  if (!next) return;

  var nextNext = next.nextElementSibling;

  row.parentNode.insertBefore(row, nextNext || next.nextSibling);

  updateOrder(selectorUpdate);
}

/* function moveDown(btn, selectorUpdate) {
var row = btn.closest("tr");
var next = row.nextElementSibling.nextElementSibling;
if (next) {
  row.parentNode.insertBefore(row, next);
  updateOrder(selectorUpdate);
}
} */

function updateOrder(selectorUpdate) {
  var inputs = document.querySelectorAll(selectorUpdate);
  inputs.forEach(function(input, index) {
    if (input) {
      input.value = index + 1;
    }
  });
}

function moveUpAna(btn) {
	var $table = $(btn).closest('table');
	var $container = $table.closest('.dAnalisis');

	var $prevTable = $table.prevAll('table:first');

	if ($prevTable.length) {
		$table.insertBefore($prevTable);
		recalcularOrdenAna($container);
	}
}

function moveDownAna(btn) {
	var $table = $(btn).closest('table');
	var $container = $table.closest('.dAnalisis');

	var $nextTable = $table.nextAll('table:first');

	if ($nextTable.length) {
		$table.insertAfter($nextTable);
		recalcularOrdenAna($container);
	}
}

function recalcularOrdenAna($container) {
  $container.find('table').each(function (index) {
    $(this).find('.order').val(index + 1);
  });
}

