$(function(){
	$('.datepicker').datepicker({
		autoclose:true,
		language:'es'
	});
	$("[name = tipo]").on("change",function(){
		switch(this.value){
		
			case"CED":
				$("#dCED").show()
				$("#dPEQ").hide()
				$("[name = 'peq']").val([])
				$("[name = 'peq']").select2({placeholder: "Buscar", allowClear: true});
				break
			case"PEQ":
				$("#dPEQ").show()
				$("#dCED").hide()
				$("[name = 'cedula']").val([])
				$("[name = 'cedula']").select2({placeholder: "Buscar", allowClear: true});
				break
			default:
				$("#dCED").hide()
				$("#dPEQ").hide()
				$("[name = 'peq']").select2({placeholder: "Buscar", allowClear: true});
				$("[name = 'cedula']").val([])
				$("[name = 'cedula']").select2({placeholder: "Buscar", allowClear: true});
		}
	})
	$("[name = 'tipo']").val("")
	$("[name = 'peq']").val([])
	$("[name = 'cedula']").val([])
	
	$("#general").show();
})

function generar(tipo){
	var aCampos = ["tipo", "fechaInicio", "fechaFin"];
	var aTipos = ["text", "text", "text"];
	if($("[name = tipo]").val() == "CED"){
		aCampos.push("cedula")
		aTipos.push("multi")
	}
	
	if($("[name = tipo]").val() == "PEQ"){
		aCampos.push("peq")
		aTipos.push("multi")
	}
	
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	if (!ordenFechasValido($("[name='fechaInicio']").val(), "<=", $("[name='fechaFin']").val())){
		bAlert("La fecha inicio debe ser anterior a la fecha fin");
		return false;
	}
	
	var url = application.sWebDbName + "xaServicios.xsp?Open&accion=postReporteTotal&id=" + Math.random()
	var campos =[
		{campo: "tipo",valor: $("[name = 'tipo']").val()},
		{campo: "cedula", valor: $("[name = 'cedula']").val()},
		{campo: "peq" , valor: $("[name = 'peq']").val()},
		{campo: "fechaInicio", valor: $("[name = 'fechaInicio']").val()},
		{campo: "fechaFin", valor: $("[name = 'fechaFin']").val()}
	]
	campos = JSON.stringify(campos)
	$("#general").hide();
	$.post(url,{
		data: campos
	},function(data) {
		var unid = data.unid
		if (tipo =="excel"){
			location.href = application.sWebDbName + "agReporteTotal?Open&tipo="+tipo+"&unid="+unid+"&id=" + Math.random()
			$("#general").show();
		}else{
			pintarTabla(unid)
		} 
		
	}).fail(function(jqXHR) {
		if (data.error){
			bAlert(data.Error)
		}
	});
}

function pintarTabla(unid){
	$("#vista").empty();
	var url = application.sWebDbName + "agReporteTotal?Open&tipo=html&unid="+unid+"&id=" + Math.random()
	$.get(url, function(data){
			$("#vista").html(data);
			$("#general").show();
	}, "html")
	.error (function(){bAlert('No se procesaron los datos, por favor intente más tarde.')})
}

function abrirDocumentos(obj){
	var td = $(obj).parents("td").first()
	var campos =[]	
	var ids = []         
	$.each(td.find("span"),function(){
		ids.push($(this).attr("id"))
	})
	campos.push({campo: "uniques",valor: ids})
	campos = JSON.stringify(campos)
	var url = application.sWebDbName + "xaServicios.xsp?Open&accion=postAbrirDocumentos&id=" + Math.random()
	$.post(url,{
		data: campos
	},function(data) {
		var unid = data.unid
		window.open(
				application.sWebDbName+"frRespuesta?Open&unid="+unid+"&id="+Math.random(),
				"_blank"
			)
		
	}).fail(function(jqXHR) {
		if (data.error){
			bAlert(data.Error)
		}
	});
}

