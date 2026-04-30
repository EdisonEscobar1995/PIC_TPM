$(function(){
	$("#general").show();
})

function guardar(){
	var aCampos = ["host", "rutaConexion", "rutaConexionDocumental", "rutaGeneral", "rutaNomina", "rutaContratistas", "rutaExitos", "rutaCostoBen", "integraCosto", "remitenteCorreos", "categoriasReconocimientos", "anchoFotos", "pasosMA", "pasosMP", "pasosEA"];
	var aTipos = ["url", "text", "text", "text", "text", "text", "text", "text", "text", "text", "text", "entero", "text", "text", "text"];
	
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	document.forms[0].submit();
}