$(function(){
	var boton= "<a id='btnEnviar' class='btn btn-mini' href='javascript:void(0)' onclick='guardarModal()'><i class='icon-arrow-right icon-white'></i> Enviar</a>";
	adaptarModal("Cambio de responsable", boton);	
	SelectFromAjaxField("[name='responsableDestino']", false, application.sWebDbName + 'agBuscarPersonas?Open&dir=all');
	$(".select2-results").css("max-height", "180px")
	$("#general").show();
})

function guardar(){
	var aCampos = ["responsableDestino", "comentario"];
	var aTipos = ["text", "text"];
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		top.bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	if ($("[name=responsableDestino]").val() == $("[name=responsableActual]").val()){
		top.bAlert("El nuevo responsable debe ser diferente al responsable actual");
		return false;
	}
	parent.$("#dModal .modal-footer").empty();
	$("#ajaxLoadingMessage").center();
	$("#ajaxLoadingMessage").show();

	if (parent.application.bEdicion){
		parent.$("[name=estadoDestino]").val($("[name=estadoOrigen]").val()); 
		parent.$("[name=responsableDestino]").val($("[name=responsableDestino]").val()); 
		parent.$("[name=comentario]").val($("[name=comentario]").val());
		parent.$("[name=evento]").val("CR");
		parent.document.forms[0].submit();
	}else{
		document.forms[0].submit();
	}
}
