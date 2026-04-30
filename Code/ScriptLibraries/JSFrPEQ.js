$(function(){
	
	if (documento.sPrint == "Si"){
		
		var redimensionarModal = function(height){
			parent.$('#ifModal').height(height+"px");
		}
		
		var imp = "<a class='btn btn-mini' href='javascript:void(0)' onclick='fnImprimir(true)'><i class='icon-print icon-white'></i> Imprimir </a>"
		adaptarModal("Vista previa",imp);
		redimensionarModal(500);
	}
	
	self.setInterval("login()",1000 * 60 * 15);
	registerPartials(["hbTrIntegrante",	                  
	                  "hbTrCertificacion",
	                  "hbTrDocumentoAsociados",
	                  "hbTrReconocimiento", 
	                  "hbDivAnexo", 
	                  "hbDivEnlaceAnexo", 
	                  "hbSelect", 
	                  "hbArbol", 
	                  "hbLista", 
	                  "hbTdBotones"])
	SelectFromAjaxField("[name='responsables']", true, application.sWebDbName + 'agBuscarPersonas?Open');
	$("[name='clasificacion']").on("change", function(){
		changeClasificacion()
	})
	$("[name='sede']").on("change", function(){
		changeSede(this);
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
			document.forms[0].submit();
		},ms);
	}
	
})

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

function cargarDatos(){
	var url = application.sWebDbName + "agCargarFormPEQ?Open"
									 + "&edit=" + (application.bEdicion ? "1" : "0") 
									 + "&unique=" + application.sUnique 
									 + "&form=" + application.sForm 
									 + "&sede=" + urlencode(documento.sSede) 
									 + "&area=" + urlencode(documento.sArea) 
									 + "&peq=" + urlencode(documento.sPEQ)
	$.getJSON(url, function(data){
		if (data.msgError == ""){
			$.each(documento.aCodPilares, function(index){
				documento.oClasificacion[this.toString()] = {codigo:this.toString(), nombre:documento.aNomPilares[index], pasos:data.pasos[this.toString()]}
			})
			documento.aRoles = data.roles;
			documento.aCategorias = data.categorias;
			documento.aIntegrantes = [{valor:"Todos"}];
			$.each(data.integrantes, function(){
				if (this.nombre != "Todos" && this.nombre != ""){
					documento.aIntegrantes.push({valor:this.nombre})
				}
			})
			
			if(data.integrantes.length == 0){
				data.integrantes = filaVacia("I");
			}else{
				$.each(data.integrantes, function (){
					this.roles = {nombre:"roles", tipo:"multiple", valores:this.roles, opciones:documento.aRoles}
				})
			}
			
			var pilar;
			$.each(data.pilares, function(index){
				pilar = this.pilar
				this.nomPilar = documento.oClasificacion[pilar].nombre.toUpperCase();
				if(this.certificaciones.length == 0){
					this.certificaciones = filaVacia("C", pilar);
				}else{
					$.each(this.certificaciones, function (){
						agregarExIntegrantes(this.integrantes)
						this.paso = {nombre:"paso", valores:[this.paso], opciones:documento.oClasificacion[pilar].pasos}
						this.integrantes = {nombre:"integrantes", tipo:"multiple", valores:this.integrantes, opciones:documento.aIntegrantes}
					})
				}
			})

			if(data.reconocimientos.length == 0){
				data.reconocimientos = filaVacia("R");
			}else{
				$.each(data.reconocimientos, function (){
					agregarExIntegrantes(this.integrantes)
					this.categoria = {nombre:"categoria", valores:[this.categoria], opciones:documento.aCategorias}
					this.integrantes = {nombre:"integrantes", tipo:"multiple", valores:this.integrantes, opciones:documento.aIntegrantes}
				})
			}
			
			if(documento.sPrint != "Si"){
				if (data.asociados.length > 0) {
					$("#dDocumentosAsociados").html(documento.templateTblDocumentosAsociados(data));
				}
			}
			
			cargarDatosSede(data);
			
			if (application.bEdicion){
				setAyudas(data);
			}
			
			if (documento.sPermitirDocumentosAsociados == "Si"){
				$(".seccionDocsAsociados").show();
			}
			
			$("#general").show();
			
			if (documento.sPrint == "Si") {
				fnImprimir();			
				setTimeout(function(){ 
					fnImprimir(true); 
				},300);
			}
			
		}else{
			location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError
		}
	})
	.error(function(){
		location.href = application.sWebDbName + "frError?Open&msg=3"
	})	
}

function cargarDatosSede(data){
	$("#dIntegrantes").html(documento.templateTblIntegrantes(data));
	
	var pilar;
	$.each(documento.aClasificacion, function(){
		pilar = this.toString();
		$.each(data.pilares, function(){
			if (this.pilar == pilar){
				$("#dCertificaciones"+pilar).html(documento.templateTblCertificaciones(this));
			}
		})
	})
	
	$("#dReconocimientos").html(documento.templateTblReconocimientos(data));
	
	if (application.bEdicion){
		$('.datepicker').datepicker({
			autoclose:true,
			language:'es'
		});
		$("[name='cedula']").each(function (index){
			SelectFromAjaxField(this, false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=C', "C", $(this).parents("tr").first());
		})
		$("[name='nombreIntegrante']").each(function (){
			SelectFromAjaxField(this, false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=N', "N", $(this).parents("tr").first());
		})
	}
	
	$("#dArea").html(documento.templateSelect({nombre:"areaPEQ", valores:[documento.sArea], opciones:data.areas}));
	$("[name='areaPEQ']").addClass("input-xxlarge").select2({placeholder: "Buscar", allowClear: true});
	$("#tblIntegrantes select, .tblCertificaciones select, #tblReconocimientos select").select2({placeholder: "Buscar", allowClear: true});
	addOnChange("#tblIntegrantes:input, .tblCertificaciones:input, #tblReconocimientos:input, [name='areaPEQ']");
	cargarDatosArea(data);
}

function cargarDatosArea(data){
	$("#dPEQ").html(documento.templateSelect({nombre:"peq", valores:[documento.sPEQ], opciones:data.peqs}));
	$("[name='peq']").addClass("input-xxlarge").select2({placeholder: "Buscar", allowClear: true});
	addOnChange("[name='peq']");
	cargarDatosPEQ(data);
}

function cargarDatosPEQ(data){
	$("#dEstructura").html(documento.templateArbol(data.estructura));
}

function changeSede(obj){
	if (documento.sSede != ""){
		bConfirm("¿Confirma que desea modificar la sede?",function(response){
			if(response){
				cambiarSede(obj.value);
            }else{
				obj.value = documento.sSede;
			}
		});
	}else{
		cambiarSede(obj.value);
	}
}

function cambiarSede(sede){
	documento.sSede = sede;
	documento.sArea = "";
	documento.sPEQ = "";
	var url = application.sWebDbName + "agCargarDatosSede?Open&sede=" + urlencode(documento.sSede); 
 	$.getJSON(url, function(data){
		if (data.msgError == ""){
			documento.aIntegrantes = [];
			documento.aRoles = data.roles;
			data.integrantes = filaVacia("I");
			data.pilares = [];
			var pilar;
			$.each(documento.aCodPilares, function(index){
				pilar = this.toString();
				data.pilares.push({"pilar":pilar, "nomPilar": documento.oClasificacion[pilar].nombre.toUpperCase(), "certificaciones":filaVacia("C", pilar)})
			})
			data.reconocimientos = filaVacia("R");
			cargarDatosSede(data);
		}else{
			bAlert(data.msgError);
		}
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})	
}

function changeArea(obj){
	documento.sArea = obj.value;
	documento.sPEQ = "";
	var url = application.sWebDbName + "agCargarDatosArea?Open&form=" + application.sForm + "&sede=" + urlencode(documento.sSede) + "&area=" + urlencode(documento.sArea); 
 	$.getJSON(url, function(data){
		if (data.msgError == ""){
			cargarDatosArea(data)
		}else{
			bAlert(data.msgError);
		}
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})	
}

function changePEQ(obj){
	documento.sPEQ = obj.value;
	var url = application.sWebDbName + "agCargarDatosPEQ?Open&form=" + application.sForm + "&sede=" + urlencode(documento.sSede) + "&area=" + urlencode(documento.sArea) + "&uniquePEQ=" + application.sUnique + "&peq=" + urlencode(documento.sPEQ); 
 	$.getJSON(url, function(data){
		if (data.msgError == ""){
			cargarDatosPEQ(data);
		}else{
			bAlert(data.msgError);
		}
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})	
}

function changeClasificacion(){
	documento.aClasificacion = [];
	var pilar;
	$("[name='clasificacion'] option").each(function(index){
		pilar = this.value;
		if (this.selected){
			documento.aClasificacion.push(pilar);
			if ($("#dCertificaciones"+pilar).html() == ""){
				$("#dCertificaciones"+pilar).html(documento.templateTblCertificaciones({pilar:pilar, nomPilar:documento.oClasificacion[pilar].nombre.toUpperCase(), certificaciones:filaVacia("C", pilar)}));
				$("#dCertificaciones"+pilar+" .datepicker").datepicker({
					autoclose:true,
					language:'es'
				});
				$("#dCertificaciones"+pilar+" select").select2({placeholder: "Buscar", allowClear: true});
			}
		}else{
			$("#dCertificaciones"+pilar).empty();
		}
	})
}

function changeCategoria(obj){
	var url = application.sWebDbName + "agCargarDatosCategoria?Open&sede=" + urlencode(documento.sSede) + "&categoria=" + urlencode(obj.value); 
 	$.getJSON(url, function(data){
		if (data.msgError == ""){
			var reconocimiento = $(obj).parents("tr").first().find("[name='reconocimiento']");
			var td = reconocimiento.parent("td");
			td.html(documento.templateSelect({nombre:"reconocimiento", valores:[], opciones:data.reconocimientos}));
			td.find("[name='reconocimiento']").select2({placeholder: "Buscar", allowClear: true});
		}else{
			bAlert(data.msgError);
		}
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})	
}

function adicionarFila(obj){
	var tr = $(obj).parents("tr").first();
	var id = tr.parents("table").first().attr("id");
	switch (id){
	case "tblIntegrantes":
		tr.after(documento.templateTrIntegrante(filaVacia("I")));
		tr = tr.next("tr");
		SelectFromAjaxField(tr.find("[name='cedula']"), false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=C', "C", tr);
		SelectFromAjaxField(tr.find("[name='nombreIntegrante']"), false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=N', "N", tr);
		break;
	case "tblReconocimientos":
		tr.after(documento.templateTrReconocimiento(filaVacia("R")));
		tr = tr.next("tr");
		break;
	default:
		var pilar = $("#"+id).attr("data-pilar");
		tr.after(documento.templateTrCertificacion(filaVacia("C", pilar)));
		tr = tr.next("tr");
		break;
	}
	addOnChange(tr.find(":input"));
	tr.find('.datepicker').datepicker({
		autoclose:true,
		language:'es'
	});
	tr.find("select").select2({placeholder: "Buscar", allowClear: true});
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
				SelectFromAjaxField(tr.find("[name='cedula']"), false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=C', "C", tr);
				SelectFromAjaxField(tr.find("[name='nombreIntegrante']"), false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=N', "N", tr);
				tr.find("select").select2({placeholder: "Buscar", allowClear: true});
			}else{
				tr.remove()
			}
			if (table.attr("id") == "tblIntegrantes"){
				actualizarIntegrantes();
			}
		}
	});
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
	case "I":
		return [{indice:indiceTabla("tblIntegrantes"), unique:"", cedula:"", nombre:"", empresa:"", roles:{nombre:"roles", tipo:"multiple", valores:[], opciones:documento.aRoles}}]
		break;
	case "C":
		return [{indice:indiceTabla("tblCertificaciones"+pilar), unique:"", fecha:"", paso:{nombre:"paso", valores:[], opciones:documento.oClasificacion[pilar].pasos}, integrantes:{nombre:"integrantes", tipo:"multiple", valores:[], opciones:documento.aIntegrantes}, anexos:[]}]
		break;
	case "R":
		return [{indice:indiceTabla("tblReconocimientos"), unique:"", fecha:"", categoria:{nombre:"categoria", valores:[""], opciones:documento.aCategorias}, reconocimiento:{nombre:"reconocimiento", valores:[], opciones:[]}, integrantes:{nombre:"integrantes", tipo:"multiple", valores:[], opciones:documento.aIntegrantes}, anexos:[]}]
		break;
	}
}

function camposValidos(){
	var contador = 0;
	var pilaresCertificados = [];
	
	var aCampos = [];
	var aTipos = [];
	
	if ($("[name='sede']").length > 0){
		aCampos.push("sede");
		aTipos.push("text");
	}
	
	aCampos.splice(aCampos, 0, "areaPEQ", "peq", "clasificacion");
	aTipos.splice(aTipos, 0, "text", "text", "multi");
	
	contador += camposNoValidos(aCampos, aTipos, true);
		
	aCampos = ["cedula", "nombreIntegrante", "empresa", "roles"] 
	aTipos = ["text", "text", "text", "multi"];
	
	$("#tblIntegrantes tbody tr").each(function(){
		contador += camposNoValidos(aCampos, aTipos, false, this);
	});
   	
	aCampos = ["fecha", "paso", "integrantes", "enlaceAnexo"];
	aTipos = ["text", "text", "multi", "anexos"];
		
	var pilar;
	var validar
   	$("[name='clasificacion'] option:selected").each(function(index){
   		pilar = this.value
   		validar = false
		$("#tblCertificaciones"+pilar+" tbody tr").each(function(index){
			if (validarFila(this, aCampos, aTipos, index)){
				contador += camposNoValidos(aCampos, aTipos, false, this);
				validar = true;
			}
		});
   		if (validar){
   			pilaresCertificados.push(pilar);
   		}
   	})
	   	
	aCampos = ["fecha", "categoria", "reconocimiento", "integrantes", "enlaceAnexo"] 
	aTipos = ["text", "text", "text", "multi", "anexos"]

	$("#tblReconocimientos tbody tr").each(function(index){
		if (validarFila(this, aCampos, aTipos, index)){
			contador += camposNoValidos(aCampos, aTipos, false, this);
		}
	});
	
	var cedula1, cedula2;
	var cedulas = $("#tblIntegrantes [name='cedula']")
	for (var i = 0; i < cedulas.length; i++){
		cedula1 = $(cedulas[i]);
		for (var k = 0; k < cedulas.length; k++){
			cedula2 = $(cedulas[k]);
			if (i != k && cedula2.val() == cedula1.val()){
				contador ++;
				if (cedula1.parents("td").first().find(".aviso").length == 0){
					cedula1.parents("td").first().append(avisoCedulaRepetida())
				}
			}
		}
	}
   	
	if (contador > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados")
		return false;
	}
	
	var indice;
	var paso;
	var pasos;
	var continuar = true;
	if (pilaresCertificados.length > 0){
		$.each(pilaresCertificados, function(){
			pilar = this.toString();
			indice = -1;
			paso = "";
			pasos = $("#tblCertificaciones"+pilar+" [name='paso']")
			
			for (var i = 0; i < pasos.length && continuar; i++){
				if ($(pasos[i]).val() != paso){
					paso = $(pasos[i]).val();
					indice ++;
					if (paso != documento.oClasificacion[pilar].pasos[indice].valor){
						bAlert("Las certificaciones de "+documento.oClasificacion[pilar].nombre+" deben estar ordenadas por pasos")
						continuar = false;
						return false;
					}
				}
			}
		})
	}
	if (!continuar){
		return false
	}

	return true;
}

function guardarDatos(){
	$("[name='area']").val($("[name='areaPEQ']").val())
	$("[name='nombre']").val($("[name='peq']").val())
	var nomClasificacion = []
	$("[name='clasificacion'] option:selected").each(function(index){
		nomClasificacion.push(this.text)
	})
	$("[name='nomClasificacion']").val(nomClasificacion.join("\r\n"))
	
	var cadena = "";
	var separador = "";
	var integrante, certificacion, reconocimiento;
	var id, clave;
	
	$("#tblIntegrantes tbody tr").each(function (index){
		integrante = $(this);
		
		cadena += formatoValor(separador, integrante.find("[name='id']").val())
		cadena += formatoValor("&", integrante.find("[name='cedula']").val())
		cadena += formatoValor("&", integrante.find("[name='nombreIntegrante']").val())
		cadena += formatoValor("&", integrante.find("[name='empresa']").val().replace(/,/g,"\r\n"))
		cadena += formatoValor("&", integrante.find("[name='roles']").val() ? integrante.find("[name='roles']").val().join("\r\n") : integrante.find("[name='roles']").val())
		separador = "@"
	})
	document.forms[0].listaIntegrantes.value = cadena;
	
	cadena = "";
	separador = "";
	
	var pilar;
	$(".tblCertificaciones").each(function(){
		pilar = $(this).attr("data-pilar");
		idTabla = $(this).attr("id")
		$(this).find("tbody tr").each(function(index){
			certificacion = $(this);
			
			id = certificacion.find("[name='id']").val();
			clave = certificacion.find("[name='fecha']").val();
			
			if (clave != ""){
				cadena += formatoValor(separador, id)
				cadena += formatoValor("&", certificacion.find("[name='fecha']").val())
				cadena += formatoValor("&", certificacion.find("[name='paso']").val())
				cadena += formatoValor("&", certificacion.find("[name='integrantes']").val() ? certificacion.find("[name='integrantes']").val().join("\r\n") : certificacion.find("[name='integrantes']").val())
				if (id == ""){
					cadena += formatoValor("&", idTabla + certificacion.attr("class"))
				}else{
					cadena += formatoValor("&", "")
				}
				cadena += formatoValor("&", pilar)
				separador = "@"	
			}
		})
	})
	document.forms[0].listaCertificaciones.value = cadena;
		
	cadena = "";
	separador = "";
	
	$("#tblReconocimientos tbody tr").each(function (index){
		reconocimiento = $(this);
		
		id = reconocimiento.find("[name='id']").val();
		clave = reconocimiento.find("[name='fecha']").val();
		
		if (clave != ""){
			cadena += formatoValor(separador, id)
			cadena += formatoValor("&", reconocimiento.find("[name='fecha']").val())
			cadena += formatoValor("&", reconocimiento.find("[name='categoria']").val())
			cadena += formatoValor("&", reconocimiento.find("[name='reconocimiento']").val())
			cadena += formatoValor("&", reconocimiento.find("[name='integrantes']").val() ? reconocimiento.find("[name='integrantes']").val().join("\r\n") : reconocimiento.find("[name='integrantes']").val())
			if (id == ""){
				cadena += formatoValor("&", "tblReconocimientos" + reconocimiento.attr("class"))
			}else{
				cadena += formatoValor("&", "")
			}
			separador = "@"	
		}
	})
	document.forms[0].listaReconocimientos.value = cadena;
	
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

