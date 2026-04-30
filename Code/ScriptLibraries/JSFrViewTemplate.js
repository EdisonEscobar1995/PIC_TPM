$(function(){
	if (application.sForm == "frBusqueda"){
		$("#vista table").prepend("<tr><th>Sede</th></tr>")
		$("#vista table tr").first().remove().end().each(function (){
			$(this).children().first().remove();
		})
		$("[name='clave']").on("keypress", function(event){
			validarEnter(event, '.btn-buscar');
		})
		$("[name='formulario']").on("change", function(){
			if ($(this).val() == "frEvaluacion" || $(this).val() == "frCertificacion") {
				$("[name='estado']").val('').trigger("change");
				$("[name='pequenioEquipo']").val('').trigger("change");
				$("[name='tipoAnio']").val('').trigger("change");
				$("[name='valorAnio']").val('');
				$(".filters").hide();
			} else {
				$(".filters").show();
				getEstadosPorFormulario();
			}
			if ($("[name='clave']").val() != ""){
				buscar()
			}else{
				$("#hits").html("0")
				$("#vista").empty()
			}
		});
		
		$("[name='valorAnio']").on('input', function (event) { 
		    this.value = this.value.replace(/[^0-9]/g, '');
		});
		
		getEstadosPorFormulario();
						
		$("#vista").css({
			"position": "absolute",
			"width": "95%",
			"top": "auto"
		});
		
		var buscarEnBDCErtificaciones = function(){
			return documento.mostrarCertificaciones == "Si" || documento.mostrarEvaluaciones == "Si";
		}
		
		
		if ($("#vista table").length > 0 && buscarEnBDCErtificaciones()) {
			var form = getUrlParameter("form");
			if (form == "") {
				var vistaDefecto = function(){
					if(documento.mostrarCertificaciones == "Si" && documento.mostrarEvaluaciones == "Si"){
						return "vwBusqueda";
					}else if(documento.mostrarCertificaciones == "Si"){
						return "vwBusquedaCertificaciones";
					}else{
						return "vwBusquedaEvaluaciones";
					}
				}
				
				localStorage.setItem("waitTable", true);
				var query = getUrlParameter("query");
				var clave = getUrlParameter("clave");
				var url = "/" + application.sRutaBdTpmCe + "/"+vistaDefecto()+"?searchView&searchMax=0&query=" + query + "&clave="+clave+"id=0.9980499507894094";
				$.ajax({
				    type: 'GET',
				    url: url,
				    contentType: "application/json; charset=utf-8",
				    dataType: "HTML",
				    success: function(data){
				        var tableVista = $(data).find("div#vista table");
				        if ($(tableVista).length > 0) {
				        	$(tableVista).find("tr").first().remove().end().each(function (){
				    			$(this).children().first().remove();
				    		});
				        	$("#vista table tbody").append($(tableVista).find("tr"));
				        	var hitsP = parseInt($("#hits").text());
				        	$("#hits").text(parseInt($(data).find("div#hits").text()) + hitsP)
				        	console.log($(data).find("div#hits").text());
				        }
				        localStorage.removeItem("waitTable");
				        $("#general").show();
				    }
				});
			}
		}else{
			localStorage.removeItem("waitTable");
		}
	}else{
		$("#vista").css({
			"position": "absolute",
			"width": "95%",
			"top": "30%"
		})
	}	
	if ($("#vista").html().indexOf('No se ha hallado ningún documento')>0 || $("#vista").html().indexOf('No documents found')>0){
		$("#vista").html("<br><p>No hay documentos en esta vista</p>");
	}
	$("#vista td").removeAttr("nowrap");
	$("img[src*='icons/ecblank']").hide();
	$("img[src*='icons/vwicnsr']").hide();
	
	cargarLabels();
	
	var url;
	$("#vista").find("a").each(function(){
		url = $(this).attr("href");
		$(this).removeAttr("href");
		url = url+"&back=Si";
		$(this).attr("href", url);
	})
	
	if (!localStorage.getItem("waitTable")) {
		$("#general").show();
	}
});

function viewPrevious(){
    $("[name='btnPrevious']").click();   
}

function viewNext(){
    $("[name='btnNext']").click();   
}

function viewExpand(){
	$("[name='btnExpand']").click();   
}

function viewCollapse(){
    $("[name='btnCollapse']").click();   
}

function viewAnteriorCK(){
	parametros = "&start=" + documento.sStart + "&dir=B&CKEditor=Body&CKEditorFuncNum=1&langCode=es"
	location.href = application.sWebDbName + "fvwArchivosCK?Open" + parametros
}

function viewSiguienteCK(){
	parametros = "&start=" + documento.sStart + "&dir=F&CKEditor=Body&CKEditorFuncNum=1&langCode=es"
	location.href = application.sWebDbName + "fvwArchivosCK?Open" + parametros
}

function crearDocumento(){
	var queryString = "";
	switch (application.sVista){
		case "vwAutores":
			queryString = "frAutores?Open"
			break;
		case "vwEnlaces":
			queryString = "frEnlace?Open"
			break;
		case "vwSedes":
			queryString = "frSede?Open"
			break;			
		case "vwCfgReconocimientos":
			queryString = "frCfgReconocimiento?Open"
			break;
		case "vwFlujos":
			queryString = "frFlujo?Open"
			break;
		case "vwGrupoResponsables":
			queryString = "frGrupoResponsables?Open"
			break;	
		case "vwEstados":
			queryString = "frEstado?Open"
			break;
		case "vwNotificaciones":
			queryString = "frNotificacion?Open"
			break;
		case "vwTransiciones":
			queryString = "frTransicion?Open"
			break;
		case "vwReportes":
			queryString = "frReporte?Open"
			break;
		}
	if (queryString != ""){
		location.href = application.sWebDbName + queryString
	}
}

function enviarURL(strURLImagen){
	window.opener.CKEDITOR.tools.callFunction(1, strURLImagen);
	window.close();	
}

function buscar(){
	var clave = $("[name='clave']").val();
	if (clave == ""){
		bAlert("Debe ingresar la clave de búsqueda");
		return false;
	}
	var vista = "vwBusqueda";
	var form = $("[name='formulario']").val();
	switch (form){
	case "frCAPDO":
		vista = "vwCAPDO";
		break;
	case "frHAN":
		vista = "vwHAN";
		break;
	case "frIMP":
		vista = "vwIMP";
		break;
	case "frLUP":
		vista = "vwLUP";
		break;
	case "frPEQ":
		vista = "vwPEQ";
		break;
	case "frPME":
		vista = "vwPME";
		break;
	case "frAccion":
		vista = "vwAccion";
		break;
	case "frEvaluacion":
		vista = "vwEvaluaciones";
		break;
	case "frCertificacion":
		vista = "vwCertificaciones";
		break;
	case "frRegistroCapacitacion":
		vista = "vwRegistroCapacitacionConsecutivo";
		break;
	}

	if (form == "frEvaluacion" || form == "frCertificacion") {
		location.href = "/" + application.sRutaBdTpmCe + "/" + vista + "?searchView&searchMax=0&query=" + urlencode(clave) + "&form="+form+"&clave="+urlencode(clave)+"&id=" + Math.random();
	} else {
		location.href = application.sWebDbName + vista + "?searchView&searchMax=0" +
			"&query=" + getQuery() +
			"&estado=" + $("[name='estado']").val() +
			"&PQE=" + $("[name='pequenioEquipo']").val() +
			"&tipoAnio=" + $("[name='tipoAnio']").val() +
			"&valorAnio=" + $("[name='valorAnio']").val() +
			"&form=" + form +
			"&clave=" + urlencode(clave) +
			"&id=" + Math.random();
	}
	
}

function getQuery() {
	var clave = $("[name='clave']").val();
	var estado = $("[name='estado']").val();
	var pequenioEquipo = $("[name='pequenioEquipo']").val();
	var tipoAnio = $("[name='tipoAnio']").val();
	var valorAnio = $("[name='valorAnio']").val();
	
	var query = $("[name='clave']").val();
	
	if (estado != "") {
		query += " AND [uniqueEstado] = " + estado;
	}
	
	if (pequenioEquipo != "") {
		query += " AND [uniquePEQ] = " + pequenioEquipo;
	}
	
	if (tipoAnio != "" && valorAnio != "") {
		var field = "["+tipoAnio+"]";
		query += " AND " + field + " >= " + "01/01/"+valorAnio + " AND " + field + " <= 31/12/"+valorAnio;
	}
	
	return query;
}

function cargarLabels() {
	var form = "";
	switch (application.sVista){
		case "vwPEQCodigo":
		case "vwPEQNombre":
		case "vwPEQClasificacion":
		case "vwPEQNivel":
			form = "frPEQ";
			break;
		case "vwCAPDOConsecutivo":
		case "vwCAPDOPeq":
		case "vwCAPDONivel":
			form = "frCAPDO";
			break;
		case "vwHANConsecutivo":
		case "vwHANPeq":
		case "vwHANNivel":
			form = "frHAN";
			break;
		case "vwIMPConsecutivo":
		case "vwIMPPeq":
		case "vwIMPNivel":
			form = "frIMP";
			break;
		case "vwLUPConsecutivo":
		case "vwLUPPeq":
		case "vwLUPNivel":
			form = "frLUP";
			break;
		case "vwPMEConsecutivo":
		case "vwPMEPeq":
		case "vwPMENivel":
			form = "frPME";
			break;
	}
	
	if (form != "") {
		var url = application.sWebDbName + "agConsultarLabelsForm?Open&form=" + form
		$.getJSON(url, function(data){
			if (data.msgError == ""){		
				
				data.labels.forEach(function(v, i){
					if (v.valor != ""){
						$("#vista").find("."+v.nombre).text(v.valor);
					}				
				})
				
			}else{
				location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError
			}
		})
		.error(function(){
			bAlert("No se procesaron los datos. por favor intente más tarde");
		})
	}	
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

function getEstadosPorFormulario() {
	var url = "xaServicios.xsp?Open&accion=getEstadosPorForm"
		+ "&form=" + $("[name='formulario']").val()
		+ "&id=" + Math.random();
	$.getJSON(url, function(data) {
		setEstados(data);
	});
}

function setEstados(data){
	var estados = $("[name='estado']");
	estados.find("option").remove();
	estados.append("<option value=''></option>")
	for (var i = 0; i < data.estados.length; i++){
		estados.append("<option value='"+data.estados[i].id+"'>"+data.estados[i].nombre+"</option>");
	}
	estados.val("");
	estados.select2({
		placeholder : "",
		allowClear : true
	});
	var estadoParam = getUrlParameter("estado");
	estados.val(estadoParam).trigger("change");
}

