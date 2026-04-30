$(function(){
	
	if (documento.sPrint == "Si"){
		var imp = "<a class='btn btn-mini' href='javascript:void(0)' onclick='fnImprimir(true)'><i class='icon-print icon-white'></i> Imprimir </a>"
		adaptarModal("Vista previa",imp);
		redimensionarModal(500);
	}
	
	if (application.bNuevo) {
		$(".seccionAsistentes").hide();
	}
	
	self.setInterval("login()",1000 * 60 * 15);
	registerPartials(["hbTrAsistentes",
	                  "hbTrDocumentoAsociados",
	                  "hbTblAsistentes",
	                  "hbDivAnexo", 
	                  "hbDivEnlaceAnexo", 
	                  "hbSelect", 
	                  "hbArbol", 
	                  "hbLista", 
	                  "hbTdBotones"])
	
	SelectFromAjaxField("[name='facilitador']", true, application.sWebDbName + 'agBuscarPersonas?Open&contratistas=Si&nomina=Si&tag=Si');
	SelectFromAjaxField("[name='coordinador']", true, application.sWebDbName + 'agBuscarPersonas?Open&contratistas=Si&nomina=Si&tag=Si');
	
	$("[name='numAsistentesEsperado']").on("change", function(){
		if ($(this).val() != ""){			
			var totalAsistentes = parseInt($(".totalAsistentes").text());
			var diferencia = parseInt($(this).val()) - totalAsistentes;			
			$(".diferenciaAsistentes").text(diferencia);
			if (diferencia != 0) {
				bAlert("Se presento una diferencia entre los asitentes y los asistente esperados.");
				$(".diferenciaAsistentes").css("color","red");
			}else{
				$(".diferenciaAsistentes").css("color","black");
			}
		}		
	})
	
	$('.datepicker').datepicker({
		autoclose:true,
		language:'es'
	});
	
	 $("[name='duracion']").on("keypress", function(e){
		var key = window.Event ? e.which : e.keyCode
		return ((key >= 48 && key <= 57) || key == 46)
	 })
	
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
			var str, flag=false, pos="";
			$("#tblAsistentes tbody tr input[name='cedula']").each(function(){				
				str = $(this).prev().prop("class");
				if (str.indexOf("select2-dropdown-open") != -1) {
					flag = true;
					pos = $(this).parents("tr").prop("class");
				}
			})
			if (flag) {
				document.forms[0].posCursorTblAsistentes.value = pos;
			}else{
				document.forms[0].posCursorTblAsistentes.value = "";
			}
			document.forms[0].submit();
					
		},ms);	
	}
	
})

function cargarDatos(callback){
	var url = application.sWebDbName + "agCargarFormRegistroCapacitacion?Open"
									 + "&edit=" + (application.bEdicion ? "1" : "0") 
									 + "&unique=" + application.sUnique 
									 + "&form=" + application.sForm
									 + "&nuevo=" + (application.bNuevo ? "1" : "0");								 
									 
	$.getJSON(url, function(data){
		if (data.msgError == ""){		
			
			if(data.asistentes.length == 0){				
				data.asistentes = filaVacia("A");
			}else{
				$(".totalAsistentes").text(data.asistentes.length);
				resultadoAsistentes();
				$("[name='numAsistentesEsperado']").removeAttr("readonly");
			}
			
			if (data.asociados.length > 0) {
				$("#dDocumentosAsociados").html(documento.templateTblDocumentosAsociados(data));
			}
			
			$("#dAsistentes").html(documento.templateTblAsistentes(data));			
			$("[name*=cedula]").css("width", "160px !important");		
			
			$(".allCheck").change(function () {
			    if ($(this).is(':checked')) {
			    	$("#tblAsistentes tbody input[type='checkbox']").each(function(){
			    		$(this).prop('checked', true);
			    	})		        
			    } else {
			    	$("#tblAsistentes tbody input[type='checkbox']").each(function(){
			    		$(this).prop('checked', false);
			    	})
			    }
			});
			
			if (application.bEdicion){
				
				/*$("[name='cedula']").each(function (index){
					var agente = application.sWebDbName + "agBuscarPersonas?Open"														
					   									+ "&contratistas=Si"
					   									+ "&nomina=Si"
					   									+ "&searchByCC=Si"
					   									+ "&query=" +this.value
					//SelectFromAjaxField(this, false, agente, "A", $(this).parents("tr").first());	
					
				})*/
				
				$("[name='cedula']").each(function (index){
					/*$(this).on("input", function(){
						buscarAsistente(this);	
					});*/
					
					$(this).bind("enterKey",function(e){
						buscarAsistente(this);
					});
					
					$(this).keyup(function(e){
					    if(e.keyCode == 13)
					    {
					        $(this).trigger("enterKey");
					    }
					});
					
				})

				var posCursor = $("[name='posCursorTblAsistentes']").val() == "" ? 0 : parseInt($("[name='posCursorTblAsistentes']").val());
				if (posCursor > 0 && documento.sPermiteAutoguardado == "Si") {					
					setTimeout(function(){
						if ($("#tblAsistentes tbody tr."+posCursor).length <= 0){
							adicionarFila($("#tblAsistentes tbody tr."+(posCursor-1)).find("a.btn.btn-success.btn-mini"), true);
						}						
					}, 0);
				}
				
				setAyudas(data);		
			}		
			
			documento.sOpcionesLugar = documento.sOpcionesLugar.filter(function(word) {	
			    if (word != ""){
					return word;
				}  
			});
			
			$("[name='lugar']").select2({
				placeholder: "Buscar", 
				allowClear: false,
				maximumSelectionSize: 1,
				tags: documento.sOpcionesLugar
			});
			
			$(".select2-choices").addClass("img-rounded");
			
			/*if (documento.sPrint != "Si"){
				$("div[class^='seccion']").hide();
			}*/
			
			if (callback){
				callback()
			}else{
				$("#general").show();
			}
		}else{
			location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError
		}
	})
	.error(function(){
		location.href = application.sWebDbName + "frError?Open&msg=3"
	})	
}

function adicionarFila(obj, focus){
	var tr = $(obj).parents("tr").first();	
	var id = tr.parents("table").first().attr("id");
	switch (id){	
	case "tblAsistentes":		
		if (tr.find("[name='cedula']").val() != ""){
			tr.after(documento.templateTrAsistentes(filaVacia("A")));
			tr = tr.next("tr");
		}else{
			bAlert("Debe ingresar la cedula del asistente.")
		}
		break;	
	}
	
	//$("[name='cedula']").each(function (index){
	/*var agente = application.sWebDbName + "agBuscarPersonas?Open"														
	   									+ "&contratistas=Si"
	   									+ "&nomina=Si"
	   									+ "&searchByCC=Si"
	SelectFromAjaxField(tr.find("input[name='cedula']"), false, agente, "A", tr);
	*/
	
		
	/*if (focus) {
		setTimeout(function(){			
			tr.find("a.select2-choice").trigger('mousedown');
		}, 0);		
	}*/
	
	/*$(tr.find("input[name='cedula']")).on("input", function(){
		buscarAsistente(this);	
	});*/
	
	$(tr.find("input[name='cedula']")).bind("enterKey",function(e){
		buscarAsistente(this);
	});
	
	$(tr.find("input[name='cedula']")).keyup(function(e){
	    if(e.keyCode == 13)
	    {
	        $(this).trigger("enterKey");
	    }
	});
	
	if (focus) {
		setTimeout(function(){			
			tr.find("input[name='cedula']").focus();
		}, 0);		
	}
	
	ordenarIndice(id);
	
}

function resultadoAsistentes(suma, resta) {
	var valor = $(".totalAsistentes").text() == "" ? 0 : parseInt($(".totalAsistentes").text());
	if (suma) {
		$(".totalAsistentes").text(valor+1);
	}
	
	if (resta) {
		$(".totalAsistentes").text(valor-1);
	}
		
	if (documento.sNumAsistentesEsperados != ""){		
		var totalAsistentes = parseInt($(".totalAsistentes").text());
		var diferencia = parseInt(documento.sNumAsistentesEsperados) - totalAsistentes;			
		$(".diferenciaAsistentes").text(diferencia);			
		if (diferencia != 0) {
			$(".diferenciaAsistentes").css("color","red");
		}else{
			$(".diferenciaAsistentes").css("color","black");
		}	
	}	
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
				
				
				/*var agente = application.sWebDbName + "agBuscarPersonas?Open"														
					+ "&contratistas=Si"
					+ "&nomina=Si"
					+ "&searchByCC=Si"
				
				SelectFromAjaxField(tr.find("[name='cedula']"), false, agente, "A", tr);*/
				
				
				$(tr.find("input[name='cedula']")).bind("enterKey",function(e){
					buscarAsistente(this);
				});
				
				$(tr.find("input[name='cedula']")).keyup(function(e){
				    if(e.keyCode == 13)
				    {
				        $(this).trigger("enterKey");
				    }
				});
				
				
				//SelectFromAjaxField(tr.find("[name='nombreIntegrante']"), false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=N', "N", tr);
				//tr.find("select").select2({placeholder: "Buscar", allowClear: true});
			}else{
				if (tr.find("[name='cedula']").val() != ""){
					resultadoAsistentes(false, true);
				}				
				tr.remove()
			}
			
			var tabla = $(table).attr("id");			
			ordenarIndice(tabla);
		}
	});
}

function eliminarFilasSeleccionadas() {
	var filasSeleccionadas = $("#tblAsistentes tbody tr input[type='checkbox']:checked").length;
	
	if (filasSeleccionadas > 0) {
		bConfirm("¿Confirma que desea eliminar la(s) fila(s) seleccionada(s)?",function(response){
			if(response){
				var tr, cedula;
				$("#tblAsistentes tbody tr input[type='checkbox']:checked").each(function(){
					tr = $(this).parents("tr");
					cedula = tr.find("[name='cedula']").val();
					tr.remove();
					if (cedula != ""){
						resultadoAsistentes(false, true);
					}
				})
				
				if ($("#tblAsistentes tbody tr").length <= 0) {
					adicionarFila($(".allCheck"));
				}
				
				ordenarIndice("tblAsistentes");
				$(".allCheck").prop("checked", false);
			}
		});
	}else{
		bAlert("Debe seleccionar al menos una fila.");
	}
	
}

function actualizarIntegrantes(){
	documento.aIntegrantes = [{valor:"Todos"}];
	$("[name='nombreIntegrante']").each(function (){
		if ($.trim($(this).val()) != ""){
			documento.aIntegrantes.push({valor:this.value})
		}
	})
	
	$("[name='integrantes']").each(function (){
		agregarExIntegrantes($(this).val());
	})
	
	$("[name='integrantes']").each(function (){
		var valores = $(this).val();
		var td = $(this).parent("td");
		td.html(documento.templateSelect({nombre:"integrantes", tipo:"multiple", valores:(valores ? valores : []), opciones:documento.aIntegrantes}));
		td.find("[name='integrantes']").select2({placeholder: "Buscar", allowClear: true});
	})
}

function filaVacia(cod, pilar){
	switch (cod){
	case "A":
		return [{indice:(indiceTabla("tblAsistentes") == 0 ? 1 : indiceTabla("tblAsistentes")), 
				unique:"", 
				cedula:"", 
				nombre:"", 
				zona:"",
				cargo:"",
				genero:"",
				tipoCargo:"",
				reentrenamiento:{selectSi:"false", selectNo:"true", valor:"No"}
		}]
		break;	
	}
}

function camposValidos(guardar){	
	var contador = 0;
	var pilaresCertificados = [];
	
	var aCampos = [];
	var aTipos = [];
		
		
	aCampos = ["coordinador", "departamento", "sede", "lugar", "fecha", "duracion"];
	aTipos = ["text", "text", "text", "text", "text", "text"];
	       	
   	if($("[name=tipoCapacitacion]").length > 0){
   		aCampos.push("tipoCapacitacion")
   		aTipos.push("multi")
   	} 
	
	contador += camposNoValidos(aCampos, aTipos, true);
	
	if (contador > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados")
		return false;
	}
	
	if (!ordenFechasValido($("[name='fecha']").val(), "<=", documento.sFechaActual )){
		bAlert("La fecha debe ser menor o igual a la fecha actual");
		return false;
	}
	
	if (guardar != "GUARDAR" || guardar == "undefined"){
		var paso;
		var continuar = true;
		contador = 0;
		
		if ($("#tblAsistentes tbody tr input[name='cedula']").length > 0) {
			$("#tblAsistentes tbody tr input[name='cedula']").each(function(){
				if ($(this).val() != ""){
					contador ++;
					aCampos = ["numAsistentesEsperado"];
					aTipos = ["text"];
				}
			})
			
			if(contador == 0){
				continuar = false;				
			}
		}else{
			continuar = false;
		}
		
		contador = 0;
		contador += camposNoValidos(aCampos, aTipos, true);
		
		if (contador > 0){
			bAlert("Por favor, diligencie correctamente los campos indicados")
			return false;
		}
		
		if (!continuar){			
			bAlert("Debe ingresar por lo menos la información de un asistente.")
			return false
		}
	}	

	return true;
}

function guardarDatos(){
		
	var cadena = "";
	var separador = "";
	var asistente, indice, clave, orden;
	var id, clave;
	
	$("#tblAsistentes tbody tr").each(function (index){
		asistente = $(this);
		indice = asistente.attr("class");
		clave = asistente.find("[name='cedula']").val();
		orden = asistente.attr("class");
		
		if (clave != "") {
			cadena += formatoValor(separador, asistente.find("[name='id']").val())
			cadena += formatoValor("&", asistente.find("[name='cedula']").val())
			cadena += formatoValor("&", asistente.find("[name='nombreAsistente']").val())
			cadena += formatoValor("&", asistente.find("[name='zonaAsistente']").val())
			cadena += formatoValor("&", asistente.find("[name='cargoAsistente']").val())	
			cadena += formatoValor("&", asistente.find("[name='generoAsistente']").val())
			cadena += formatoValor("&", asistente.find("[name='tipoCargoAsistente']").val())
			cadena += formatoValor("&", asistente.find("[name='reentrenamiento_"+indice+"']:checked").val())
			cadena += formatoValor("&", orden)
					
			separador = "@"
		}
		
	})
	document.forms[0].listaAsistentes.value = cadena;
	
	document.forms[0].totalAsistentes.value = $(".totalAsistentes").text();
	document.forms[0].diferenciaAsistentes.value = $(".diferenciaAsistentes").text();
	
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

function fnImprimir(imp) {
	if (imp) {
		var target = parent.top.document.getElementById('ifModal');			
		try{
			target.contentWindow.document.execCommand('print', false, null);
		}catch(e){
			target.contentWindow.print();
		}
	}else{
		$("#tblIntegrantes input, #tblIntegrantes select, " +
		  "#tblCertificacionesEA input, #tblCertificacionesEA select, " + 
		  "#tblReconocimientos input, #tblReconocimientos select").each(function(){
			$(this).parent().append("<span>"+$(this).val()+"</span>");
			$(this).prev().hide();
			$(this).hide();			
		})
		
		$(".btn").remove();
		$(".contenedorCabezote").remove();
		$(".icon-remove").remove();
		
		$(".cabeza").css({"position": "absolute", "top": "0"});
		$(".container").css("margin-top","6.5%");		
		$("input[type=radio]").prop("disabled",true);
		
		$("#tblIntegrantes td, " +
		  "#tblCertificacionesEA td, " +
		  "#tblReconocimientos td").each(function(){
			if($(this).html() == ""){		
				$(this).remove();
			}
		})
		
	}	
	
}

function buscarAsistente(obj){
	var url = application.sWebDbName + "agBuscarPersonas?Open"														
		+ "&contratistas=Si"
		+ "&nomina=Si"
		+ "&searchByCC=Si"
		+ "&query=" + obj.value
	
	var td = $(obj).parent();
	var div = td.find(".dCedula");
	div.html(""); 
	$.getJSON(url, function(data){
		if(data.nodes.length > 0 ){
			
			if(data.nodes.length == 1){
				var a = $("<a href='javascript:void(0)' onclick='setAsistente(this)' data-cedula='"+data.nodes[0].cedula+"'" +
						"data-nombre='"+data.nodes[0].nombre+"'" +
						"data-zona='"+data.nodes[0].zona+"'" +
						"data-cargo='"+data.nodes[0].cargo+"'" +
						"data-genero='"+data.nodes[0].genero+"'" +
						"data-tipoCargo='"+data.nodes[0].tipoCargo+"'" +
						"data-reentrenamiento='"+data.nodes[0].reentrenamiento+"'" +
								">"+data.nodes[0].id+" - "+ data.nodes[0].nombre+"</a>");
				var tmpDiv = $("<div></div>")
				tmpDiv.append(a);
				div.append(tmpDiv);
				a.click();
			}else{
				data.nodes.forEach(function(node){
					div.append("<div>" +
							"<a href='javascript:void(0)' onclick='setAsistente(this)' data-cedula='"+node.cedula+"'" +
									"data-nombre='"+node.nombre+"'" +
									"data-zona='"+node.zona+"'" +
									"data-cargo='"+node.cargo+"'" +
									"data-genero='"+node.genero+"'" +
									"data-tipoCargo='"+node.tipoCargo+"'" +
									"data-reentrenamiento='"+node.reentrenamiento+"'" +
											">"+node.id+" - "+ node.nombre+"</a>" +
									"</div>")	
				})
			}
		}else{
			div.html("<div>No se encontraron resultados</div>");
		}
	})	
}

function setAsistente(obj){
	var tr = $(obj).parents("tr").first();
	var table = $(tr).parents("table").attr("id");
	var fila = $(tr).attr("class");
	var flag = false;
	var div = $(obj).parents(".dCedula");
	var datos = $(obj);
	
	$(tr).find("[name='cedula']").val(datos.attr("data-cedula"));
	$(tr).find("[name='nombreAsistente']").val(datos.attr("data-nombre"));
	$(tr).find("[name='zonaAsistente']").val(datos.attr("data-zona"));
	$(tr).find("[name='cargoAsistente']").val(datos.attr("data-cargo"));
	$(tr).find("[name='generoAsistente']").val(datos.attr("data-genero"));
	$(tr).find("[name='tipoCargoAsistente']").val(datos.attr("data-tipoCargo"));            				
	resultadoAsistentes(true);
	
	$("[name='numAsistentesEsperado']").removeAttr("readonly");
	if ($(tr).next().length == 0) {
		adicionarFila("a.btn.btn-success.btn-mini", true);
	}else if($("#"+table+" tbody tr."+(parseInt(fila)+1)).find("[name='cedula']").val() == ""){            					
		setTimeout(function(){            						
			$("#"+table+" tbody tr."+(parseInt(fila)+1)).find("a.select2-choice").trigger('mousedown');
		},0);           					
	}else{
		adicionarFila("a.btn.btn-success.btn-mini", true);
	}
	
	ordenarIndice(table);
	div.empty();
}
