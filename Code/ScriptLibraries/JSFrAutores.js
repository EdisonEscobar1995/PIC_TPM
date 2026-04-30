$(function(){
	SelectFromAjaxField("[name='nombres']", true, application.sWebDbName + 'agBuscarPersonas?Open');
	$("#general").show();
})

function guardar(){
	var aCampos = ["sede", "formularios"];
	var aTipos = ["text", "multi"];
	      
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	
	if ($("[name=nombres]").val() == "" && $("[name=organizaciones]").val() == ""){
		bAlert("Debe ingresar al menos un nombre o una organización")
		return false
	}
	
	var formularios = [];
	$("[name='formularios'] option:selected").each(function(){
		formularios.push($(this).text().replace(/\r|\n|\r\n/g, ""));
	})
	$("[name='nomFormularios']").val(formularios.join("\r\n"))
	document.forms[0].submit();
}