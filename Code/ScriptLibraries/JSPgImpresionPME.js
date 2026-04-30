$(function(){
	adaptarModal("Vista previa","");
	redimensionarModal(500)
	var id = ""
	$.each($("#tbPilares").find("span"),function(){
		id = limpiarTexto($(this).attr("id"))
		$(this).attr("id",id)
	})
	if(parent.application.bEdicion){
		campos();
	}
	else{
		cargarCampos();
	}
})

function campos(){
	var pilares = []
	 if (parent.documento.sAplicaPilares == "Si"){
		 pilares = parent.$("[name = pilares]").val()
	  }else{
		  $("#tbPilares").hide()
	  }             
	var fuentes = []
	if (parent.documento.sAplicaFuente == "Si"){
		fuentes = parent.$("[name = fuente]").val()
	}else{
		$(".fuentes").hide()
	}
	
	var autorSugerencia = ""
	if (parent.documento.sAplicaAutorSugerencia  == "Si"){
		autorSugerencia = parent.$("[name=autorSugerencia]").val()
	}else{
		$(".autorSugerencia").hide()
	}
	
	campos = {"nombre":parent.$("[name=titulo]").val(),
			"antes":parent.$("[name=antes]").val().split("\n").join("[<br>]"),
			"despues":parent.$("[name=despues]").val().split("\n").join("[<br>]"),
			"proceso":parent.$("[name=maquinaProceso]").val(),
			"area":parent.$("[name=area]").val(),
			"equipo":parent.$("[name = nomPEQ]").val(),
			"autorSugerencia":autorSugerencia,
			"fechaPropuesta":parent.$("[name=fechaPropuesta]").val(),
			"fechaImplementacion":parent.$("[name=fechaImplementacion]").val(),
			"costo":parent.$("[name=costo]").val(),
			"beneficioTangible":parent.$("[name=beneficioTangible]").val(),
			"beneficioIntangible":parent.$("[name=beneficioIntangible]").val(),
			"imagenAntes":parent.$("#dImagenAntes").find(".imagenAntesDespues").attr("src"),
			"imagenDespues":parent.$("#dImagenDespues").find(".imagenAntesDespues").attr("src"),
			"replica" : parent.$("[name = aplicaReplica]").val(),
			"lugarReplica" : parent.$("[name = lugarReplica]").val(),
			"herramientas" : parent.$("[name = herramientas]").val(),
			"indicadores" : parent.$("[name = indicadores]").val(),
			"fuentes" : fuentes,
			"pilares" : pilares,
			"consecutivo" : parent.documento.sConsecutivo,
			"exitoInnovador" : parent.$("[name = exitoInnovador]").val(),
			"fechaActualizacion" : parent.documento.sFechaPublicacion  
		}
	asignarCampos(campos)
}


function cargarCampos(){
	var url = parent.application.sWebDbName+"agCargarCamposImpresion?Open&Unique="+parent.application.sUnique;
	$.getJSON(url, function(data){
		if (data.msgError == ""){
			data.campos.indicadores = data.campos.indicadores.split(",")
			data.campos.herramientas = data.campos.herramientas.split(",")
			
			if (parent.documento.sAplicaFuente == "Si"){
				data.campos.fuentes = data.campos.fuentes.split(",")
			}else{
				data.campos.fuentes = []
				$(".fuentes").hide()                       
			}
			
			if (parent.documento.sAplicaPilares == "Si"){
				data.campos.pilares = data.campos.pilares.split(",")
			}else{
				data.campos.pilares = []
				$("#tbPilares").hide()                       	
			}
			
			if (parent.documento.sAplicaAutorSugerencia == "No"){
				data.campos.autorSugerencia = ""
				$(".autorSugerencia").hide()	
			}
			
			asignarCampos(data.campos)
		}
		else{
			top.bAlert("Error al cargar vista previa");
		}
		
	})
	.error (function(){top.bAlert('No se procesaron los datos, por favor intente más tarde.')})
}

function adaptarModal(titulo, htmlBotones){
	var btnCerrar = "<a class='btn btn-mini' href='javascript:void(0)' onclick='cerrarModal()'><i class='icon-remove icon-white'></i> Cerrar </a>"
	parent.$("#dModal .modal-header").find("h3").remove().end().append("<h3>"+titulo+"</h3>")
	parent.$("#dModal .modal-footer").html((htmlBotones ? htmlBotones : "") + btnCerrar);
}

function asignarCampos(data){
	$("#consecutivo").html(data.consecutivo)
	$("#titulo").html(data.nombre)
	$(".nombrePE").html(data.equipo)
	$("#detalleAntes").html(data.antes)
	$("#detalleDespues").html(data.despues)
	$("#proceso").html(data.proceso)
	$("#area").html(data.area)
	$("#autorSugerencia").html(data.autorSugerencia)
	$("#fechaPropuesta").html(data.fechaPropuesta)
	$("#fechaImplementacion").html(data.fechaImplementacion)
	$("#costo").html(data.costo)
	$("#beneficioTangible").html(data.beneficioTangible)
	$("#beneficioIntangible").html(data.beneficioIntangible)
	$("#exitoInnovador").html(data.exitoInnovador)
	$("#fechaActualizacion").html(data.fechaActualizacion)
	if (data.replica == "Si"){
		$("#replica").html(data.replica+"<br>"+data.lugarReplica)
	}else{
		$("#replica").html(data.replica)
	}
	marcarX(data.herramientas,"h")
	marcarX(data.indicadores,"i")
	marcarX(data.fuentes,"")
	marcarX(data.pilares,"")
	window.print();
	$("#espera").hide();
	$("#general").show();
}

function marcarX(arreglo,tipo){
	var id=""
	if (arreglo && arreglo.length > 0){
		$.each(arreglo,function(){
			id = this.replace(/[ ]/g,"_").replace(/[(]/g,"").replace(/[)]/g,"").replace(new RegExp("/", 'g'),"")
			if ($("#"+tipo+id)){
				$("#"+tipo+id).html("X")
			}
		})
	}
}

function redimensionarModal(margen){
	if (!margen){
		margen = 0;
	}
	
	parent.$('#ifModal').height(($("#general").height() + margen) +  "px")
}

function limpiarTexto(texto){
	texto = texto.replace(new RegExp("/", 'g'),"")
	return texto
}