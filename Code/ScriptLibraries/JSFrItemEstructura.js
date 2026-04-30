$(function(){
	var botones = "<a class='btn btn-mini' href='javascript:void(0)' onclick='guardarModal()'><i class='icon-save icon-white'></i> Guardar </a>"
	adaptarModal("Item de estructura", botones)
	$("select[name='seccion']").val($("input[name='seccion']").val()).select2({
		placeholder: "Buscar", 
		allowClear: true
	});
	$("#general").show();
})

function guardar(){
	var aCampos = [];
	var aTipos = [];
	var nombre = "";
	
	$("input[name='seccion']").val($("select[name='seccion']").val())
	
	switch (documento.sCodigo){
		case "sede":
			aCampos.push("sede");
			aTipos.push("text");
			nombre = $("[name='sede']").val();
			break;
		case "area":
			aCampos.splice(aCampos.length, 0, "area", "seccion");
			aTipos.splice(aTipos.length, 0, "text", "text");
			nombre = $("[name='area']").val();
			break;
		case "nivel":
			aCampos.splice(aCampos.length, 0, "nivel", "esPEQ", "seccion");
			aTipos.splice(aTipos.length, 0, "text", "text", "text");
			nombre = $("[name='nivel']").val();
			break;
	}
	
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		parent.bAlert("Por favor, diligencie correctamente los campos indicados");
		return false;
	}

	parent.$("#dModal .modal-footer").empty();
	$("#general").hide();
	$("[name='nombre']").val(nombre);
	document.forms[0].submit()
}