$(function(){
	SelectFromAjaxField("[name='usuarios']", true, application.sWebDbName + 'agBuscarPersonas?Open&dir=all')
	$("#general").show();
})

function guardar(){
	var aCampos = ["nombre", "usuarios", "campoFecha", "formula", "columnas", "campos", "tienePadre"];
	var aTipos = ["text", "text", "text", "text", "text", "text", "text"];
	
	if ($("[name='tienePadre']").val() == "Si"){
		aCampos.splice(aCampos.length, 0, "columnasPadre", "camposPadre");
		aTipos.splice(aCampos.length, 0, "text", "text");
	}
	
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	
	var enter = /\r|\n|\r\n/g
	var aColumnas = $("[name='columnas']").val().split(enter)
	var aCampos = $("[name='campos']").val().split(enter)
	
	if (!longitudesValidas(aColumnas, aCampos, "columnas")){
		return false
	}
			
	if ($("[name='tienePadre']").val() == "Si"){
		aColumnas = $("[name='columnasPadre']").val().split(enter)
		aCampos = $("[name='camposPadre']").val().split(enter)
		if (!longitudesValidas(aColumnas, aCampos, "columnasPadre")){
			return false;
		}
	}
		
	validarClave(function(){
		document.forms[0].submit();
	});
}

function longitudesValidas(array1, array2, campo){
	if (array1.length != array2.length){
		if($("[name='"+campo+"']").parents("td").first().find(".aviso").length == 0){
			$("[name='"+campo+"']").parents("td").first().append(avisoLongitudDiferente())
		}
		return false;
	}
	return true;
}

function avisoLongitudDiferente(){
	return "<div class=aviso>El número de columnas no coincide con el número de campos</div>"
}
