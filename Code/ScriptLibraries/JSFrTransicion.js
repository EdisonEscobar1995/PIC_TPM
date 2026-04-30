$(function(){
	$("[name=flujo]").on("change",function(){
		actualizarElementos("dOrigen;dDestino");
	})
	$("[name='notificaciones'], [name='condiciones'], [name='acciones']").each(function (){
		if ($(this).val() == ""){
			$(this).val([]);
		}
		$(this).select2({placeholder: "Buscar"});
	})
	$("#general").show();
})

function actualizarElementos(lista){
	if (lista == ""){
		return false;
	}
	var url;
	var arreglo = lista.split(";")
	for (var i = 0; i < arreglo.length; i++){
		switch(arreglo[i]){
			case "dOrigen":
				url = application.sWebDbName+"pgAjaxSelect?OpenPage&name=estadoOrigen&vista=vwProgEstadosFlujo&clave="+$("select[name='flujo']").val()+"&colNom=2&colVal=3";
				break;
			case "dDestino":
				url = application.sWebDbName+"pgAjaxSelect?OpenPage&name=estadoDestino&vista=vwProgEstadosFlujo&clave="+$("select[name='flujo']").val()+"&colNom=2&colVal=3";
				break;
		}
		$("#"+arreglo[i]).load(url, function(response, status, xhr) {
			$("[name='estadoOrigen'], [name='estadoDestino']").select2({placeholder: "Buscar"})
			if (status == "error") {
  				mostrarValidacion("No ha sido posible cargar los maestros. " + xhr.status + " " + xhr.statusText)
   			}
		})
	}
}

function guardar(){
	var aCampos = ["flujo","estadoOrigen","estadoDestino","direccion"];
	var aTipos = ["text","text","text","text"];

	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	validarClave(function(){
		document.forms[0].submit();
	});
}
