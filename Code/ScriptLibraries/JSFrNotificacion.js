$(function(){
	SelectFromAjaxField("[name='desNombre'], [name='desAdicionales']", true, application.sWebDbName + 'agBuscarPersonas?Open');
	$("[name=modAsigDes]").on("change",function(){
		switch ($(this).val()){
		case "C":
			$("#dDesCampo").show();
			$("#dDesNombre ").hide();
			$("#dDesGrupo ").hide();
			break;
		case "N":
			$("#dDesCampo ").hide();
			$("#dDesGrupo ").hide();
			$("#dDesNombre ").show();
			break;
		case "G":
			$("#dDesCampo ").hide();
			$("#dDesNombre ").hide();
			$("#dDesGrupo ").show();
			break;
		default :
			$("#dDesCampo ").hide();
			$("#dDesNombre ").hide();
			$("#dDesGRupo ").hide();
			break;
		}
	})
	$("#general").show();
})

function guardar(){
	var aCampos = ["nombre","asunto","mensaje","enlace","modAsigDes"];
	var aTipos = ["text","text","text","text","text"];
	var modo = $("[name=modAsigDes]").val();
	if (modo == "C"){
		aCampos.push("desCampo");
		aTipos.push("multi");
	}else{
		if (modo == "N"){
			aCampos.push("desNombre");
			aTipos.push("multi");
		}
		
		if (modo == "G"){
			aCampos.push("desGrupo");
			aTipos.push("multi");
		}
	}

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
