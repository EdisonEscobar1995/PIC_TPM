$(function(){
	$("#cargador").attr("name",  $("#fileUpload").attr("name"));
	$("#general").show();
})

function cargar(){
	var html = function(data){
		$("#vista").html(
			"<div>Documentos creados: " + data.documentosCreados + "</div>"+
			"<div>Capacitaciones creadas: " + data.capacitacionesCreadas + "</div>"
		);
	};
	
	var ruta = $("#cargador").val();
	var idCargador = "#cargador";
	if(ruta){
		$("#vista").html("");
		var reg = /xls|xlsx/g;
		var extensionesValidas = "xls o xlsx";
		
		ruta = ruta.substring(ruta.lastIndexOf(".") + 1, ruta.length).toLowerCase();
		if (!ruta.match(reg)){
			bAlert("Debe elegir un archivo con extensión " + extensionesValidas);
			$(idCargador).val("");
			return false;
		}
		
		$("#ajaxLoadingMessage").center();
		$("#ajaxLoadingMessage").show();
		
		var files = $(idCargador)[0].files;
		var i,f;
		  
		for (i = 0; i != files.length; ++i) {
			f = files[i];
			var reader = new FileReader();
			var name = f.name;
		    
			reader.onload = function(e) {
				var data = e.target.result;
				var arr = fixdata(data);
				var workbook = XLSX.read(btoa(arr), {type: 'base64'});
		  
				/* DO SOMETHING WITH workbook HERE */
		  
				var first_sheet_name = workbook.SheetNames[0];
				/* Get worksheet */
				var worksheet = workbook.Sheets[first_sheet_name];
				
				var aDatos = renombrarAtributos(XLSX.utils.sheet_to_json(worksheet));
				
				if(aDatos.length > 0){
					$(".cargar").prop("disable", true);
					var ruta = application.sWebDbName+"xaServicios.xsp?Open&accion=cargarDatosRegistroCapacitacion&id=" + Math.random();
					
					$.post(ruta,{
						data: JSON.stringify({
							datos:aDatos
						})
					},function(data) {
						if(data.error == ""){
							bAlert("Migración finalizada",function(){
								$(idCargador).val("");
								$(".fileupload-preview").text("");
								$(".icon-file").remove();
								html(data);
							});
						}else{
							bAlert(data.error, function(){
								$("#vista").html("");
							});
						}
						$(".cargar").prop("disable", false);
						$("#ajaxLoadingMessage").hide();
					}).fail(function(jqXHR) {
						var data = errorRequest(jqXHR)
						if (data.error){
							bAlert(data.error, function(){
								$("#vista").html("");
							})
						}
						$(".cargar").prop("disable", false);
						$("#ajaxLoadingMessage").hide();
					});
				}else{
					bAlert("El archivo no fue guardado como un libro de excel, por favor corregirlo y volver a cargarlo");
					$("#ajaxLoadingMessage").hide();
				}
			}
		    
		    reader.readAsArrayBuffer(f);
		  }
	}else{
		bAlert("Debe seleccionar el archivo a cargar");
		$(".cargar").prop("disable", false);
		$("#ajaxLoadingMessage").hide();
	}
	
}

function renombrarAtributos(aDatos){
	var valor = function(sValor){
		return sValor ? sValor.trim() : "";
	}
	
	var temCapacitacion = "";
	
	for(i in aDatos){
		if(aDatos[i]["#"]){
			
			aDatos[i]["nombre"] =  valor(aDatos[i]["Nombre"]);
			aDatos[i]["cedula"] =  valor(aDatos[i]["Cédula"]);
			aDatos[i]["zona"] = valor(aDatos[i]["Zona"]);
			aDatos[i]["cargo"] = valor(aDatos[i]["CARGO"]);
			aDatos[i]["genero"] = valor(aDatos[i]["SEXO"]);
			aDatos[i]["tipoCargo"] = valor(aDatos[i]["Nivel del cargo"]);
			aDatos[i]["reentrenamiento"] = valor(aDatos[i]["¿Reentramiento?"]);
			
			aDatos[i]["consecutivo"] = valor(aDatos[i]["#"]);
			aDatos[i]["sede"] = valor(aDatos[i]["Regional"]);
			aDatos[i]["temaCapacitacion"] = valor(aDatos[i]["Tema Capacitación"]);
			aDatos[i]["fecha"] = valor(aDatos[i]["Fecha"]);
			aDatos[i]["duracion"] = valor(aDatos[i]["Total de Horas"]);
			aDatos[i]["programa"] = valor(aDatos[i]["Programa"]);
			aDatos[i]["facilitador"] = valor(aDatos[i]["Formador"]);
			aDatos[i]["departamento"] = valor(aDatos[i]["Área/Depto"]);
			aDatos[i]["coordinador"] = valor(aDatos[i]["Coordinador"]);
			aDatos[i]["totalAsistentes"] = valor(aDatos[i]["Tot. Asistentes"]);
			aDatos[i]["mes"] = valor(aDatos[i]["Mes"]);
			aDatos[i]["anio"] = valor(aDatos[i]["Año"]);
			aDatos[i]["tipoCapacitacion"] = valor(aDatos[i]["TIPO CAPACITACIÓN"]);
			aDatos[i]["lugar"] = valor(aDatos[i]["Salón"]);
			aDatos[i]["facilitadorIE"] = valor(aDatos[i]["I/E"]);
			
			var removeAtributes = [
			                       "#",
			                       "Nombre",
			                       "Cédula",
			                       "Zona",
			                       "Tema Capacitación",
			                       "Fecha",
			                       "Total de Horas",
			                       "Regional",
			                       "Programa",
			                       "Formador",
			                       "Área/Depto",
			                       "Coordinador",
			                       "Tot. Asistentes",
			                       "Mes",
			                       "Año",
			                       "CARGO",
			                       "TIPO CAPACITACIÓN",
			                       "SEXO",
			                       "¿Reentramiento?",
			                       "Salón",
			                       "I/E",
			                       "Nivel del cargo"];
			
			
			removeAtributes.forEach(function(valor){
				delete aDatos[i][valor];
			});	
		}
	}
	
	return aDatos;
}

function fixdata(data){
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}