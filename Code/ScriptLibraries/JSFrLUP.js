$(function(){
	
	if (documento.sPrint == "Si"){
		var imp = "<a class='btn btn-mini' href='javascript:void(0)' onclick='fnImprimir(true)'><i class='icon-print icon-white'></i> Imprimir </a>"
		adaptarModal("Vista previa",imp);
		redimensionarModal(500);
	}
	
	self.setInterval("login()",1000 * 60 * 15);
	registerPartials(["hbTrEntrenamiento",
	                  "hbTrDocumentoAsociados",
	                  "hbDivAnexo", 
	                  "hbDivEnlaceAnexo", 
	                  "hbSelect", 
	                  "hbInputHidden", 
	                  "hbArbol", 
	                  "hbTdBotones"])
	SelectFromAjaxField("[name='colaboradores']", true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
	SelectFromAjaxField("[name='asesor']", false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
	cargarAnexos(function(){
		cargarDatos();
	})
	
	if (documento.sPermiteAutoguardado == "Si" && 
		application.bEdicion && 
		parseInt(documento.sTiempoAutoguardado, 10) > 0 ) {
		var segundos = parseInt(documento.sTiempoAutoguardado, 10) * 60;
		var ms = segundos * 1000;
		setTimeout(function(){
			guardarDatos();
			document.forms[0].submit();
		},ms);
	}
	
})

function cargarDatosEntrenamientos(data){
	if(data.entrenamientos.length == 0){
		data.entrenamientos = filaVacia("E");
	}
	$("#dEntrenamientos").html(documento.templateTblEntrenamientos(data));
	if (application.bEdicion){
		SelectFromAjaxField("[name='entrenador']", false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
		SelectFromAjaxField("[name='asistentes']", true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A&tag=Si');
		addOnChange($("#tblEntrenamientos:input").not("#tblEntrenamientos [name='asistentes']"));
		$("#tblEntrenamientos [name='asistentes']").each(function(){
			setSelect2MultiValue(this, $(this).parents("tr").first().attr("class"));
		})
	}
}

function adicionarFila(obj){
	var tr = $(obj).parents("tr").first();
	switch (tr.parents("table").first().attr("id")){
	case "tblEntrenamientos":
		tr.after(documento.templateTrEntrenamiento(filaVacia("E")));
		tr = tr.next("tr");
		SelectFromAjaxField(tr.find("[name='entrenador']"), false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
		SelectFromAjaxField(tr.find("[name='asistentes']"), true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A&tag=Si');
		addOnChange(tr.find(":input").not("[name='asistentes']"));
		setSelect2MultiValue(tr.find("[name='asistentes']"), tr.attr("class"));
	break;
	default:
		addOnChange(tr.find(":input"));
	}
	tr.find('.datepicker').datepicker({
		autoclose:true,
		language:'es'
	});
}

function clearSelec2MultiValueAjax(campo, clase){
	var tr = $("."+clase);
	tr.find("[name='"+campo+"']").val("").addClass("input-large");
	switch(campo){
	case "asistentes":
		SelectFromAjaxField(tr.find("[name='asistentes']"), true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A&tag=Si');
		break;
	}
	
}

function eliminarFila(obj){
	bConfirm("¿Confirma que desea eliminar la fila seleccionada?",function(response){
		if(response){
			var table = $(obj).parents("table").first();
			var tr = $(obj).parents("tr").first();
			if (tr.siblings().length == 0){
				tr.find("input, select, textarea").each(function (){
					$(this).val("");
				})
				tr.find(".aviso").remove();
				SelectFromAjaxField(tr.find("[name='entrenador']"), false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
				SelectFromAjaxField(tr.find("[name='asistentes']"), true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A&tag=Si');
			}else{
				tr.remove()
			}
		}
	});
}

function filaVacia(cod){
	switch (cod){
	case "E":
		var asistentes = [];
		if ($("#tblEntrenamientos tbody tr").length > 0){
			$.each(documento.aIntegrantes, function(){
				asistentes.push(this.valor)
			})
		}
		return [{indice:indiceTabla("tblEntrenamientos"), unique:"", fecha:"", duracion:"", entrenador:"", conclusiones:[], asistentes:asistentes.join(",")}]
		break;
	}
}

function camposValidos(){
	var contador = 0;
	
	var aCampos = [];
	var aTipos = [];
	
	if ($("[name='sede']").length > 0){
		aCampos.push("sede");
		aTipos.push("text");
	}
	
	aCampos.splice(aCampos, 0, "areaPEQ", "fechaElaboracion", "titulo");
	aTipos.splice(aTipos, 0, "text", "text", "text");
	
	$.each(documento.aCamposAValidar, function (){
		aCampos.push(this);
		if (this == "indicadores" || this == "fuentes" || this == "pilares"){
			aTipos.push("multi");
		}else{
			aTipos.push("text");
		}
	})
	
	var nombreCampo = $(".ckeditor-field").attr("name");
	var cadena = $('#cke_'+nombreCampo+' iframe').contents().find('body').html();
	cadena = cadena.replace(/<[^>]+>/g,'');
	if (cadena == "") {
		aCampos.push("dVacio");
		aTipos.push("div");
	}
	
	contador += camposNoValidos(aCampos, aTipos, true);
		
	aCampos = ["fecha", "duracion", "entrenador", "conclusiones", "asistentes"] 
	aTipos = ["text", "text", "text", "text", "text"]
	          
	$("#tblEntrenamientos tbody tr").each(function(index){
		if (validarFila(this, aCampos, aTipos, index)){
			contador += camposNoValidos(aCampos, aTipos, false, this);
		}
	});
	
	if (contador > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados");
		return false;
	}
	
	if (!ordenFechasValido($("[name='fechaElaboracion']").val(), "<=", documento.sFechaInscripcion)){
		bAlert("La fecha de elaboración no debe ser posterior a la fecha de inscripción");
		return false;
	}
	return true;
}

function guardarDatos(){
	guardarDatosPEQ();
	
	var cadena = "";
	var separador = "";
	var entrenamiento;
	var clave;
		
	cadena = "";
	separador = "";
	
	$("#tblEntrenamientos tbody tr").each(function (index){
		entrenamiento = $(this);
		
		clave = entrenamiento.find("[name='fecha']").val();
		
		if (clave != ""){
			cadena += formatoValor(separador, entrenamiento.find("[name='id']").val())
			cadena += formatoValor("&", entrenamiento.find("[name='fecha']").val())
			cadena += formatoValor("&", entrenamiento.find("[name='duracion']").val())
			cadena += formatoValor("&", entrenamiento.find("[name='entrenador']").val())
			cadena += formatoValor("&", entrenamiento.find("[name='conclusiones']").val())
			cadena += formatoValor("&", entrenamiento.find("[name='asistentes']").val().replace(/,/g,"\r\n"))
			separador = "@"	
		}
	})
	document.forms[0].listaEntrenamientos.value = cadena;
	
	 var docAsociados, cadena = [];

	 if (!application.bNuevo && $("#tblDocumentoAsociados tbody tr").length > 0) {
	        
	         $("#tblDocumentoAsociados tbody tr").each(function (index){
	             docAsociados = $(this);           
	             cadena.push(docAsociados.find("input[name='id']").val());           
	         })
	        
	     }

	 document.forms[0].idsAsociados.value = cadena;
	
	document.forms[0].tipoDocumento.value = "";
	document.forms[0].consecutivoBusqueda.value = "";
}

function fnImprimir(imp) {
	if (imp) {
		var target = parent.top.document.getElementById('ifModal');			
		try{
			target.contentWindow.document.execCommand('print', false, null);
		}catch(e){
			target.contentWindow.print();
		}
	}else{
		$("#tblEntrenamientos input, #tblEntrenamientos select").each(function(){					
			$(this).parent().append("<span>"+$(this).val()+"</span>");
			$(this).prev().hide();
			$(this).hide();
		})
		
		$("#tblEntrenamientos textarea").each(function(){
			$(this).parent().append("<span>"+$(this).val()+"</span>");
			$(this).hide();
		})
		
		$(".btn").remove();
		$(".contenedorCabezote").remove();
		$(".icon-remove").remove();
		
		$(".cabeza").css({"position": "absolute", "top": "0"});
		$(".container").css("margin-top","6.5%");		
		$("input[type=radio]").prop("disabled",true);
		
		$("#dBody table").css("width","100%");
		
		$("#tblEntrenamientos td").each(function(){
			if($(this).html() == ""){		
				$(this).remove();
			}
		})
		
	}	
	
}

