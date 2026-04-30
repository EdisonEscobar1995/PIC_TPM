$(function(){
	$("[name='entradas']").attr("rows", 10);
	if (documento.sFormulario == "frHabilidad") {
		$("[name='certificacion']").on("change",function(){
			getTipoCertificaciones();
		});
	}
	self.setInterval("login()",1000 * 60 * 15);
	registerPartials(["hbTrHabilidades",
	                  "hbTblHabilidades",
	                  "hbTdBotones"])
	$("#dHabilidades").html(documento.templateTblHabilidades({habilidades:filaVacia()}));
	$("[name='certificadores']").each(function (index){
		var agente = application.sWebDbName + "agBuscarPersonas?Open"
	   									+ "&contratistas=Si"
	   									+ "&nomina=Si"
	   									+ "&tag=Si"
	   	SelectFromAjaxField(("input[name='certificadores']"), true, agente);
	
	});                  
	$("#general").show();
})

function getTipoCertificaciones(){
	var url = "xaServicios.xsp?Open&accion=getTipoCertificaciones"
			+ "&certificacion=" + $("[name='certificacion']").val()
			+ "&id=" + Math.random();
	$.getJSON(url, function(data) {
		setTipoCertificaciones(data);
	});
}

function setTipoCertificaciones(data){
	var tiposCertificaciones = $("[name='tipoCertificacion']")
	tiposCertificaciones.find("option").remove();
	tiposCertificaciones.append("<option value=''></option>")
	for (var i = 0; i < data.tipoCertificaciones.length; i++){
		tiposCertificaciones.append("<option value='"+data.tipoCertificaciones[i].codigo+"'>"+data.tipoCertificaciones[i].nombre+"</option>")
	}
	tiposCertificaciones.val("");
	tiposCertificaciones.select2({
		placeholder : "",
		allowClear : true
	});
}

function filaVacia() {
	return [{
		indice:(indiceTabla("tblAsistentes") == 0 ? 1 : indiceTabla("tblAsistentes")),
		nombre: "",
		certificadores: []
	}]
}

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

function adicionarFila(obj, focus){
	var tr = $(obj).parents("tr").first();	
	var id = tr.parents("table").first().attr("id");
	switch (id){	
	case "tblHabilidades":		
		if (tr.find("[name='nombre']").val() != ""){
			tr.after(documento.templateTrHabilidades(filaVacia("A")));
			tr = tr.next("tr");
		}else{
			bAlert("Debe ingresar un nombre de habilidad.", function(){
				setTimeout(function(){			
					tr.find("input[name='nombre']").focus();
				}, 0);	
			})
		}
		break;	
	}
	
	$("[name='certificadores']").each(function (index){
		var agente = application.sWebDbName + "agBuscarPersonas?Open"
	   									+ "&contratistas=Si"
	   									+ "&nomina=Si"
	   									+ "&tag=Si"
	   	SelectFromAjaxField(tr.find("input[name='certificadores']"), true, agente);
	
	});
	ordenarIndice(id);
	window.scrollTo(0,document.body.scrollHeight);
}

function eliminarFila(obj){
	bConfirm("¿Confirma que desea eliminar la fila seleccionada?",function(response){
		if(response){
			var table = $(obj).parents("table").first();
			var tr = $(obj).parents("tr").first();
			if (tr.siblings().length == 0){
				tr.find("input, select").each(function (){
					$(this).val("");
				})
				tr.find("select[multiple]").each(function (){
					$(this).val([]);
				})
				
				tr.find(".aviso").remove();
				
				
				var agente = application.sWebDbName + "agBuscarPersonas?Open"
					+ "&contratistas=Si"
					+ "&nomina=Si"
					+ "&tag=Si"
				SelectFromAjaxField(tr.find("input[name='certificadores']"), true, agente);
				
			}else{				
				tr.remove()
			}
			
			var tabla = $(table).attr("id");			
			ordenarIndice(tabla);
		}
	});
}

function ordenarIndice(tabla) {
	var span;
	var fila;
	$("#"+tabla+" tbody tr").each(function(i, val){	
		fila = $(this).attr("class");
		if (fila){
			span = $(this).find(".indice_"+(fila));			
			$(this).removeAttr("class");
			$(this).attr("class", (i+1));					
		}
		
	})
}

function guardar(){
	var aCampos = ["entradas"];
	var aTipos = ["text"];
	if (documento.sFormulario == "frHabilidad") {
		aCampos = ["certificacion", "tipoCertificacion", "aplicaValidacionEvaluacion"];
		aTipos = ["text", "text", "text"];
	}
	
	if (documento.sFormulario == "frTipoCertificacion") {
		aCampos.push("certificacion");
		aTipos.push("text");
	}
	      
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	
	$.post(application.sWebDbName + "xaServicios.xsp?Open&accion=guardarMasivo&id=" + Math.random(),{
		data: JSON.stringify(getDatosEntradas())
	},function(data) {
		if(data.error == ""){
			location.href = application.sWebDbName + documento.sRedirecTo;
		}else{
			bAlert(data.error);
		}
	}).fail(function(jqXHR) {
		var data = errorRequest(jqXHR)
		if (data.error){
			bAlert(data.Error)
		}
	});
	
	// document.forms[0].submit();
}

function getDatosEntradas(){
	var obj = {
		form: documento.sFormulario
	}
	
	if (documento.sFormulario == "frHabilidad") {
		obj.certificacion = $("[name='certificacion']").val().trim();
		obj.tipoCertificacion = $("[name='tipoCertificacion']").val().trim();
		obj.aplicaValidacionEvaluacion = $("[name='aplicaValidacionEvaluacion']").val().trim();
		var habilidades = [];
		var certificadores = [];
		document.querySelectorAll("#tblHabilidades tbody tr").forEach(function(e,i){
		    var habilidad = $(e)
		    habilidades.push(habilidad.find("input[name='nombre']").val());
		    certificadores.push(habilidad.find("[name='certificadores']").val().split(","));
		});
		obj.entradas = habilidades;
		obj.certificadores = certificadores;
	} else {
		var entradas = [];
		var strEntradas = $("[name='entradas']").val().replace(/\r/g, "");
		strEntradas = strEntradas.split("\n");
		for (var i in strEntradas) {
			if (strEntradas[i] !== "") {
				entradas.push(strEntradas[i]);
			}
		}
		
		obj.entradas = entradas;
		
		if (documento.sFormulario == "frTipoCertificacion") {
			obj.certificacion = $("[name='certificacion']").val().trim();
		}
	}
	
	return obj;
}
