
$(function(){
	registerPartials(["hbTblCapacitaciones", "hbTrCapacitaciones"]);
	SelectFromAjaxField("[name='nombreCedula']", false, application.sWebDbName + 'agSearchAsistentes?Open');
	$('.datepicker').not(".limpiar").datepicker({
		autoclose:true,
		language:'es'
	});
	
	if(!$("[name='programa']").val() || !$("[name='programa']").val()[0]){
		$("[name='programa']").val([]).trigger("change")
	}
	
	if(!$("[name='tipoCapacitacion']").val() || !$("[name='tipoCapacitacion']").val()[0]){
		$("[name='tipoCapacitacion']").val([]).trigger("change");
	}
	
	$("#general").show();
})

function generar(tipo){
	tipo = tipo ? tipo : "";
	if(camposValidos()){
		var ruta = application.sWebDbName+"xaServicios.xsp?Open&accion=postReporteRegistroCapacitacion&id=" + Math.random();
		$.post(ruta,{
			data: JSON.stringify({
				filtros:getFiltros(),
				tipo:tipo
			})
		},function(data) {
			if(data.error == ""){
				if(tipo == "excel"){					
					location.href = "xaServicios.xsp?Open&accion=generarExcelRegistroCapacitaciones&unique=" + data.unique
				}else{
					
					$("#vista").html(documento.templateTblCapacitaciones(data));
					
					if (data.capacitaciones.length > 0) {
						var filtersConfig = {					       
								col_0: 'select',
								col_1: 'select',
						        col_2: 'select',
						        col_3: 'select',
						        col_4: 'select',
						        col_5: 'select',
						        col_6: 'select',
						        col_7: 'select',
						        col_8: 'select',
						        col_9: 'select',
						        clear_filter_text: "",
						        sort_select: true,
						        btn_reset: true,
						        help_instructions: false,
						        col_widths: [
						            '70px', '70px', '100px',
						            '70px', '70px', '70px',
						            '10px', '60px', '60px', '10px' 
						        ]
						    };
						
						
						var tf = new TableFilter('tblResultados', filtersConfig);
					    tf.init();
					}					
				}
			}else{
				bAlert(data.error);
			}
		}).fail(function(jqXHR) {
			var data = errorRequest(jqXHR)
			if (data.error){
				bAlert(data.error)
			}
		});
	}
}

function getFiltros(){
	var filtros = [];
	var valor = "";
	var campos = [
	              "consecutivo", 
	              "programa", 
	              "facilitador", 
	              "tipoCapacitacion", 
	              "fechaInicio", 
	              "temaCapacitacion", 
	              "nombreCedula", 
	              "departamento", 
	              "fechaFin"
	              ];
	$.each(campos, function(index, campo){
		valor = $("[name='"+campo+"']").val();
		if(valor){
			filtros.push({campo:campo, valor: valor});	
		}
	});
	
	return filtros;
}

function camposValidos(){
	var contador = 0;
	
	if(!$("[name='consecutivo']").val() && !$("[name='programa']").val() && !$("[name='facilitador']").val() && !$("[name='tipoCapacitacion']").val() && !$("[name='fechaInicio']").val() && !$("[name='temaCapacitacion']").val() && !$("[name='nombreCedula']").val() && !$("[name='departamento']").val() && !$("[name='fechaFin']").val()){
		bAlert("Debe ingresar al menos un filtro de búsqueda");
		return false;
	}
	
	var aCampos = [];
	var aTipos = [];
	
	if($("[name='fechaInicio']").val()){
		aCampos.push("fechaFin");
		aTipos.push("text");
	}

	if($("[name='fechaFin']").val()){
		aCampos.push("fechaInicio");
		aTipos.push("text");
	}
	
	if (aCampos.length > 0 && camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	
	if($("[name='fechaInicio']").val() && $("[name='fechaFin']").val()){
		if (!ordenFechasValido($("[name='fechaInicio']").val(), "<=", $("[name='fechaFin']").val())){
			bAlert("La fecha inicio debe ser anterior a la fecha fin");
			return false;
		}
	}
	
	return true;
}

function limpiarCampo(campo){
	$("[name='"+campo+"']").val("");
}