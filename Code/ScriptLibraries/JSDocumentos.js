Handlebars.registerHelper('selected', function(opcion, valores) {
	var values = !valores ? [] : valores;
	if (isMember(opcion, values)){
		return "selected"
	}
	return ""
});

Handlebars.registerHelper('checked', function(select) {
	if (select == "true") {
		return "checked"
	}
	return ""
});

Handlebars.registerHelper('selectSi', function(select) {
	if (select == "true") {
		return "Si";
	}
	return "";
});

Handlebars.registerHelper('selectNo', function(select) {
	if (select == "true") {
		return "No";
	}
	return "";
});

Handlebars.registerHelper('change', function(nombre) {
	switch(nombre){
	case "areaPEQ":
		return "onChange=changeArea(this)";
		break;
	case "peq":
		return "onChange=changePEQ(this)";
		break;
	case "categoria":
		return "onChange=changeCategoria(this)";
		break;
	}
	return ""
});

Handlebars.registerHelper('lista', function(valor) {
	return valor.split(",").join("<br>")
});

function indiceTabla(id){
	var indice = -1;
	var i;
	$("#"+id+" tbody tr").each(function (){
		i = parseInt($(this).attr("class"));
		if (i > indice){
			indice = i;
		}
	});
	return indice + 1;
}

function guardar(){
	if (!camposValidos("GUARDAR")){
		return false;
	}
	validarClave(function(){
		guardarDatos(true);
		if(application.sForm != "frHAN"){
			document.forms[0].submit();
		}
	});
}

function adelantar(){
	cambiarEstado("AD")
}

function retroceder(){
	cambiarEstado("AT")
}

function registrarUtilidad(opinion){
	abrirModal(application.sWebDbName + "frUtilidad?Open&form=" + application.sForm + "&unique=" + application.sUnique + "&opinion=" + opinion, 250);
}

function cambiarEstado(direccion){
	if (application.bEdicion){
		if (!camposValidos()){
			return false;
		}
		validarClave(function(){
			if(application.sForm == "frHAN"){
				guardarDatos(false, abrirCambioEstado, direccion);
			}else{
				guardarDatos();
				abrirCambioEstado(direccion);				
			}
		});
	}else{
		abrirCambioEstado(direccion)
	}
}

function cambiarResponsable(){
	if (application.bEdicion){
		if (!camposValidos()){
			return false;
		}
		validarClave(function(){
			guardarDatos();
			abrirCambioResponsable();
		});
	}else{
		abrirCambioResponsable();
	}
}

function abrirCambioEstado(direccion){
	abrirModal(application.sWebDbName + (direccion ? "frCambioEstado" : "frAdmonFlujo") + "?Open&unique=" + application.sUnique + "&flu=" + documento.sUniqueFlujo + "&est=" + documento.sUniqueEstado + "&dir=" + (direccion ? direccion : "") + "&edi=" + (application.bEdicion ? "1" : "0"), 330);
}

function abrirCambioResponsable(){
	abrirModal(application.sWebDbName + "frCambioResponsable?Open&unique=" + application.sUnique + "&est=" + documento.sUniqueEstado, 250);
}

function agregarExIntegrantes(arreglo){
	if (arreglo){
		$.each(arreglo, function(){
			if (isNotIntegrante(this.toString(), documento.aIntegrantes)){
				documento.aIntegrantes.push({valor:this.toString()})
			}
		})
	}
}

function isNotIntegrante(valor, arreglo){
	for (var i = 0; i < arreglo.length; i++){
		if (arreglo[i].valor == valor){
			return false
		}
	}
	return true	
}

function verUtilidad(){
	abrirModal(application.sWebDbName + "frHistorialUtilidad?Open&unique=" + application.sUnique, 250);
}

function verHistorial(){
	abrirModal(application.sWebDbName + "frHistorial?Open&unique=" + application.sUnique, 250);
}

function setAyudas(data, isPrint){
	var campo;
	var element;
	$.each(data.ayudas, function(){
		campo = this.campo.toLowerCase()
		element = "<span class='label label-info ayuda' rel='popover' data-html='true' data-content=\""+this.ayuda.join("<br>")+"\">?</span>";
		if (isPrint) {
			element = "<div class='dPrintLabelAyuda'>"+this.ayuda.join("<br>")+"</div>";
		}
		$(":input").filter(function(){
			return this.name.toLowerCase() == campo
		}).parents("td").append(element);
	})
	$(".ayuda").popover({trigger:"hover"});
}

function setLabels(data){
	var campo;
	$.each(data.labels, function(){
		campo = this.campo.toLowerCase();
		campo = campo.replace(campo.substring(0,5), "")
		$(":input").filter(function(){
			return this.name.toLowerCase() == campo
		}).parents("td").prev().replaceWith("<td>"+this.valor+"</td>")			
	});
}

function imprimir(direccion){
	
	switch(application.sForm) {
	    case "frPME":
	    	var url = application.sWebDbName+"pgImpresionPME?Open&uniquePadre="+application.sUnique;
	    	abrirModalLarge(url,"modalLarge")
	        break;
	    case "frHAN":
	    	var url = application.sWebDbName+"/vwImpresionHAN/"+application.sUnique+"?Open&print=Si";
	    	abrirModalLarge(url, "modalLarge");
	        break;
	    case "frPEQ":
	    	var url = application.sWebDbName+"/vwImpresionPEQ/"+application.sUnique+"?Open&print=Si";
	    	abrirModalLarge(url, "modalLarge");
	        break;
	    case "frLUP":
	    	var url = application.sWebDbName+"/vwImpresionLUP/"+application.sUnique+"?Open&print=Si";
	    	abrirModalLarge(url, "modalLarge");
	        break;
	    case "frIMP":
	    	var url = application.sWebDbName+"/vwImpresionIMP/"+application.sUnique+"?Open&print=Si";
	    	abrirModalLarge(url, "modalLarge");
	        break;
	    case "frCAPDO":
	    	var url = application.sWebDbName+"/vwImpresionCAPDO/"+application.sUnique+"?Open&print=Si";
	    	abrirModalLarge(url, "modalLarge");
	        break;
	    case "frAccion":
	    	var url = application.sWebDbName+"/vwImpresionAccion/"+application.sUnique+"?Open&print=Si";
	    	abrirModalLarge(url, "modalLarge");
	        break;
	        
	}
	
	
}