$(function(){
	$("[name='botones']").select2({placeholder: "Buscar"});
	SelectFromAjaxField("[name='ediNombre']", true, application.sWebDbName + 'agBuscarPersonas?Open');
	SelectFromAjaxField("[name='resNombre']", true, application.sWebDbName + 'agBuscarPersonas?Open');
	$("[name=modAsigRes]").on("change",function(){
		switch ($(this).val()){
		case "C":
			$("#dResCampo").show();
			$("#dResNombre ").hide();
			$("#dResAnteriorDefecto ").hide();
			break;
		case "N":
			$("#dResCampo ").hide();
			$("#dResNombre ").show();
			$("#dResAnteriorDefecto ").hide();
			$("#dResGrupo").hide();
			break;
		case "F":
			$("#dResCampo ").hide();
			$("#dResNombre ").hide();
			$("#dResGrupo").hide();
			$("#dResAnteriorDefecto ").show();
			break;
		case "G":
			$("#dResCampo ").hide();
			$("#dResNombre").hide();
			$("#dResAnteriorDefecto").hide();
			$("#dResGrupo").show();
			break;	
		default :
			$("#dResCampo ").hide();
			$("#dResNombre ").hide();
			$("#dResAnteriorDefecto ").hide();
			$("#dResGrupo").hide();
			break;
		}
	})
	
	$("[name=modAsigEdi]").on("change",function(){
		switch ($(this).val()){
		case "C":
			$("#dEdiCampo").show();
			$("#dEdiNombre ").hide();
			$("#dEdiGrupo").hide();
			break;
		case "N":
			$("#dEdiCampo ").hide();
			$("#dEdiGrupo").hide();
			$("#dEdiNombre ").show();
			break;
		case "G":
			$("#dEdiCampo ").hide();
			$("#dEdiNombre ").hide();
			$("#dEdiGrupo").show();
			break;	
		default :
			$("#dEdiCampo ").hide();
			$("#dEdiNombre ").hide();
			$("#dEdiGrupo").hide();
			break;
		}
	})
	$("#general").show();
})


function guardar(){
	var aCampos = ["flujo","nombre","posicion","inicial","final","rechazo","fechaPublicacion"];
	var aTipos = ["text","text","entero","text","text","text","text"];
	if ($("[name='diasAlarma']").val() != ""){
		aCampos.push("diasAlarma");
		aTipos.push("entero");
	}
	
	var fin = $("[name='final']").val();	
	var modo;
	if (fin != "Si"){
		modo = $("[name='modAsigRes']").val();
		aCampos.push("modAsigRes");
		aTipos.push("text");
	
		if (modo == "C"){
			aCampos.push("resCampo");
			aTipos.push("text");
		}else{
			if (modo == "N"){
				aCampos.push("resNombre");
				aTipos.push("text");
			}
		}
	}
	modo = $("[name='modAsigEdi']").val();
	if (modo == "C"){
		aCampos.push("ediCampo");
		aTipos.push("text");
	}else{
		if (modo == "N"){
			aCampos.push("ediNombre");
			aTipos.push("text");
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
