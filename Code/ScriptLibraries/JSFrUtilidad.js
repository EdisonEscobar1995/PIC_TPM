$(function(){
	var boton= "<a id='btnEnviar' class='btn btn-mini' href='javascript:void(0)' onclick='guardarModal()'><i class='icon-arrow-right icon-white'></i> Enviar</a>";
	adaptarModal("Utilidad de la información", boton);	
	$("#general").show();
})

function guardar(){
	var aCampos = ["comentario"];
	var aTipos = ["text"];
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		top.bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	parent.$("#dModal .modal-footer").empty();

	$("#ajaxLoadingMessage").center();
	$("#ajaxLoadingMessage").show();

	document.forms[0].submit();
}
