$(function(){ 
	$("table").addClass("mainTable table table-striped table-bordered table-condensed");
	$(".noStriped").removeClass("table-striped");
	$(".tblEstandar .titulo").css({
		"background":"#adef32",
		"text-align":"center",
		"font-weight":"bold"
	});
	$(".tblEstandar th").css({
		"background":"#00bfff",
		"color":"#fff",
		"text-align":"center"
	});
	$('#dModal').on('hide', function (){
		try{
			delete window.frames["ifModal"];
		}catch(e){
		}
		$(this).find("h3").remove()
		$(this).find(".modal-body, .modal-footer").empty();
	})
	$("input:not([type])").attr("type", "text");
	addOnChange(':input');
	$("select:not([multiple])").each(function(){
		$(this).find("option").first().text($(this).find("option").first().text().replace(/\r|\n|\r\n/g, ""));
	})
	
	$("select").select2({
		placeholder: "Buscar", 
		allowClear: true
	});
	setSelect2MultiValue("select[multiple]")
	
	$("textarea").attr("rows","5");
	$(".ckeditor-field").each(function(){
		editor = CKEDITOR.replace(this.id, {
			customConfig : application.sWebDbName + 'ckeditor/config_Custom.js?Open'
			,filebrowserUploadUrl: application.sWebDbName + 'frCKUpload?CreateDocument'
			,filebrowserBrowseUrl : application.sWebDbName + 'fvwArchivosCK?Open'
		    ,filebrowserWindowWidth : '640'
	        ,filebrowserWindowHeight : '480'
		} );
		editor.on( 'afterCommandExec', renameCKUpload );
	});
	
	$(document).ajaxStart(
		function(){	
	  		$("#ajaxLoadingMessage").center();
	  		$("#ajaxLoadingMessage").show();
	 	}
	).ajaxStop(
		function(){		
    		$("#ajaxLoadingMessage").hide();
    		$(".xspPrevious").html("Anterior");
    		$(".xspNext").html("Siguiente");
    	}
	)
	switch (application.sForm){
	case "frError":
	case "frRespuesta":
		$("#general").show();
		break;
	}
});

function addOnChange(selector){
	if (application.bEdicion){
		$(selector).on("change", function () {
			$(this).parents("td").first().children(".aviso").remove() 
		})
	}
}

function setSelect2MultiValue(selector, clase){
	$(selector).each(function (){
		if($(this).val()){
			$(this).prev("div").find(".select2-search-choice").first().before("<span class='select2-selection__clear' onclick='clearSelec2MultiValue(\""+this.name+"\", \""+clase+"\")'></span>")
		}
		$(this).on("change", function (){
			$(this).prev("div").find(".select2-selection__clear").remove()
			if($(this).val()){
				$(this).prev("div").find(".select2-search-choice").first().before("<span class='select2-selection__clear' onclick='clearSelec2MultiValue(\""+this.name+"\", \""+clase+"\")'></span>")
			}
			$(this).parents("td").first().children(".aviso").remove() 
		})
	})
}

function bAlert(sMess, callback){
    if(!callback){
        callback = function(){};
    }
    bootbox.alert(
            sMess,
            callback
            );
    $(".bootbox .modal-body").css({"height":"auto","width":"500px"});
}

function bConfirm(sMess, callback){
    bootbox.confirm(
            sMess, 
            function(result) {                        
                callback(result)                
            }
    );
    $(".bootbox .modal-body").css({"height":"auto","width":"500px"});
}

function login(){
	document.getElementById("ifRefrescar").src = application.sWebDbName + "pgVacia?OpenPage&login&id=" + Math.random();
}

function abrirRuta(ruta, externa){
	var sWebDbName = application.sWebDbName;
	if (externa) {
		sWebDbName = "/" + application.sRutaBdTpmEC + "/";
	}
	location.href = sWebDbName + ruta + "&id=" + Math.random();
}

function seleccionarTodos(flag){
	if(flag){
		$("[name='$$SelectDoc']").attr("checked", true);
	}else{
		$("[name='$$SelectDoc']").removeAttr("checked");
	}
}

function nuevoDocumento(){
	location.href = application.sWebDbName + application.sForm + "?OpenForm"
}

function editar(){
	window.open(application.sWebDbName + "0/" + application.sUnid + "?EditDocument", document._domino_target);
}

function cerrar(){
	if (application.sBack == "Si"){
		window.history.back();
	}else{
		location.href = application.sWebDbName + application.sRedireccion + "&id=" + Math.random()
	}	
}

function regresarHome() {
	location.href = application.sWebDbName;
}

function regresarDOC(universalID) {
	location.href = application.sWebDbName + "0/" + universalID;
}

function abrirModal(url, height){
	$("#dModal .modal-body").height(height+"px");
	$("#dModal").modal({backdrop: "static",show: true});
	$("#dModal .modal-body").html("<iframe name='ifModal' style='width:100%;height:"+height+"px' frameBorder='no' vspace='0' src='"+url+"'></iframe>");
}

function adaptarModal(titulo, htmlBotones){
	var btnCerrar = "<a class='btn btn-mini' href='javascript:void(0)' onclick='cerrarModal()'><i class='icon-remove icon-white'></i> Cerrar </a>";
	if(titulo == "<br>"){
		parent.$("#dModal .modal-header").html((htmlBotones ? htmlBotones : "") + btnCerrar);
		
		parent.$("#dModal .modal-header").css("text-align","right");
	}else{
		parent.$("#dModal .modal-header").find("h3").remove().end().append("<h3>"+titulo+"</h3>");		
	}
		
	parent.$("#dModal .modal-footer").html((htmlBotones ? htmlBotones : "") + btnCerrar);
}

function guardarModal(){
	window.frames["ifModal"].guardar()
}

function cerrarModal(){
	$("#dModal").modal("hide");
	if(window.application.sForm != "frAccion"){
		setModalStyle()
	}
}

function renameCKUpload( eventObject ){
	var eventType = eventObject.data.name;
	
	var eventTypeCheck = eventType + ',';	
	if( 'image,link,imagebutton,flash,'.indexOf( eventTypeCheck ) === -1 ){ 
		return 
	}
	
	renameFileUpload();
		
	function renameFileUpload(){
		var iframes = document.getElementsByTagName( 'iframe' );
		var dialogFrame, dialogDoc;
		for( var i=0, len = iframes.length; i < len; i++ ){
			if( iframes[i].id.indexOf( 'fileInput' ) > 0 ){
				dialogFrame = iframes[i];
				dialogDoc = dialogFrame.contentWindow.document;
				break;
			}
		}
				
		if( !(dialogFrame && dialogDoc.forms.length === 1) ){ 
			setTimeout( renameFileUpload, 1000 ); 
			return; 
		}
		
		var fieldName = '%%File.' + application.sReplicaId.toLowerCase() + '.' + application.sUnidCKUpload + '.$Body.0.70';
		dialogDoc.forms[0].upload.name = fieldName;
	}
}

function validarClave(callback){
	var parametros = "";
	var formulario = application.sForm;
	switch(formulario){
		case "frFlujo":
			parametros = "&nombre=" + urlencode($("[name='nombre']").val()) + "&formularios=" + $("[name='formularios']").val().join(";");
			break;
		case "frEstado":
			parametros = "&flujo="+urlencode($("[name=flujo]").val())+"&nombre="+urlencode($("[name=nombre]").val())+"&inicial="+urlencode($("[name=inicial]").val());
			break;
		case "frNotificacion":
		case "frReporte":
			parametros = "&sede=" + urlencode($("[name='sede']").val()) + "&nombre=" + urlencode($("[name='nombre']").val());
			break;
		case "frPEQ":
			parametros = "&sede=" + urlencode($("[name='sede']").val()) + "&nombre=" + urlencode($("[name='peq']").val());
			break;
		case "frTransicion":
			parametros = "&flujo="+urlencode($("[name=flujo]").val())+"&estadoOrigen="+urlencode($("[name=estadoOrigen]").val())+"&estadoDestino="+urlencode($("[name=estadoDestino]").val());
			break;	
		case "frEnlace":
		case "frSede":
			parametros = "&nombre=" + urlencode($("[name='nombre']").val())
			break;
		case "frCfgReconocimiento":
			parametros = "&categoria=" + urlencode($("[name='categoria']").val()) + "&nombre=" + urlencode($("[name='nombre']").val())
			break;
		case "frEquipoMaquina":
		case "frMaestroCertificacion":
		case "frClasificacionBeneneficio":
			parametros = "&nombre=" + urlencode($("[name='nombre']").val().trim());
			break;
		case "frTipoCertificacion":
			parametros = "&certificacion=" + urlencode($("[name='certificacion']").val()) + "&nombre=" + urlencode($("[name='nombre']").val().trim());
		case "frHabilidad":
			parametros = "&certificacion=" + urlencode($("[name='certificacion']").val()) +
						 "&tipoCertificacion=" + urlencode($("[name='tipoCertificacion']").val()) + 
						 "&nombre=" + urlencode($("[name='nombre']").val().trim());
			break;
		case "frLUP":
		case "frIMP":
		case "frPME":
		case "frCAPDO":
		case "frHAN":
			parametros = "&sede=" + urlencode($("[name='sede']").val()) + "&titulo=" + urlencode($("[name='titulo']").val());
			break;
	}
	var url = application.sWebDbName + "agValidarClave?Open&form=" + formulario + "&unid=" + application.sUnid + parametros;
	$.getJSON(url, function(data){
		if (data.msgError == ""){
			callback();
		}else{
			bAlert(data.msgError);
		}
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})
}

function eliminarDocumento(){
	bConfirm("¿Confirma que desea eliminar el documento?",function(response){
		if(response){
			var url = application.sWebDbName + "agEliminarDocumento?Open&unique=" + application.sUnique;
			$.getJSON(url, function(data){
				if (data.msgError == ""){
					if (application.sForm != "frAccion") {
						switch (application.sForm) {
							case "frEquipoMaquina":
							case "frMaestroCertificacion":
							case "frTipoCertificacion":
							case "frHabilidad":
								location.href = application.sWebDbName + "frAlert?Open&msg=2&redirect=" + application.sRedireccion
								break;
							default:
								location.href = application.sWebDbName + "frRespuesta?Open&msg=2&id=" + Math.random()
								break;
						}						
					}else{
						parent.$("tr[name='"+application.sUnique+"']").remove();
						parent.cerrarModal();
					}
				}else{
					bAlert(data.msgError);
				}
			})
			.error(function(){
				bAlert("No se procesaron los datos. por favor intente mÃ¡s tarde");
			})                            
		}
	});
}

function convertirANumero(cadena){
	if (cadena == ""){
		return 0
	}
	cadena = cadena.replace(/\./g, ",") 
	var arreglo = cadena.split(",")
	if (arreglo.length == 1){
		retorno = parseFloat(cadena)
	}else{
		if (arreglo[1] != ""){
			retorno = parseFloat(arreglo[0]) + (parseFloat(arreglo[1]) / (Math.pow(10,parseFloat(arreglo[1].length))))
		}else{
			retorno = parseFloat(arreglo[0])
		}
	}
	return retorno
}

function formatoNumero(numero){
	var cadena = numero + "";
	cadena = cadena.replace(/\./g, ",")
	var arreglo = cadena.split(",")
	cadena = ""
	encontro = false
	for (var i = 0; i < arreglo[0].length; i++){
		if (arreglo[0].substring(i,i+1) != "0" || encontro){
			cadena += arreglo[0].substring(i,i+1)
			encontro = true 
		}
	}
	arreglo[0] = cadena == "" ? "0" : cadena
	if (arreglo.length == 1){
		cadena = arreglo[0] + ",00"
	}else{
		cadena = arreglo[0] + "," + (arreglo[1]+"00").substring(0, 2)
	}	
	return cadena
}

function urlencode (str) {
    str = (str+'').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}

function cero(){
	return "0,00"	
}

function avisoRequerido(){
	return "<div class=aviso>Campo requerido</div>"
}

function avisoNumero(){
	return "<div class=aviso>Ingrese un valor numÃ©rico</div>"
}

function avisoEntero(){
	return "<div class=aviso>Ingrese un nÃºmero entero</div>"
}

function avisoEntero4(){
	return "<div class=aviso>Ingrese un nÃºmero de 4 dÃ­gitos</div>"
}

function avisoNumeros(){
	return "<div class=aviso>Ingrese solamente nÃºmeros</div>"
}

function avisoAlfaNum(){
	return "<div class=aviso>Ingrese valor alfanumÃ©rico</div>"
}

function avisoUrl(){
	return "<div class=aviso>El formato de la url no es vÃ¡lido</div>"
}

function avisoImagen(){
	return "<div class=aviso>Seleccione un archivo con extensiÃ³n png, jpg o gif</div>"
}

function avisoCedulaRepetida(){
	return "<div class=aviso>CÃ©dula repetida</div>"
}

function esNumero(cadena){
	re =/^\d+(\,(\d+))?$/;
	if (cadena.match(re)){
		return true;
	}
	return false;
}

function esEntero(cadena){
	var re =/^\d+$/;
	return cadena.match(re)
}

function esAlfaNum(cadena){
	re1 =/^[a-zA-Z0-9]+$/ 
	if (cadena.match(re1)){
		return true;
	}
	return false;
}

function formatoUrlValido(cadena){
	re1 = /^https?:\/\/([\w\-\.])+(:\d+)?(\/.*)?$/;
	if (cadena.match(re1)){
		return true;
	}
	return false;
}

function soloNumeros(cadena){
	var re =/^\d+?$/;
	return cadena.match(re)
}

function extensionValida(ruta, reg){
	if (ruta == ""){
		return false
	}
	ruta = ruta.substring(ruta.lastIndexOf(".") + 1, ruta.length).toLowerCase();
	if (!ruta.match(reg)){
		return false;
	}
	return true
}

function camposNoValidos(campos, tipos, flag, seccion){
	if (flag){
		$(".aviso").remove();
	}
	
	var contador = 0
	for(var i = campos.length - 1; i >= 0; i--){
		var tipo = tipos[i];
		var campo;
		if (tipo == "div"){
			if (seccion){
				campo = $(seccion).find("[id='"+campos[i]+"']");	
			}else{
				campo = $("[id='"+campos[i]+"']");	
			}
		}else{
			if (seccion){
				campo = $(seccion).find("[name='"+campos[i]+"']");
			}else{
				campo = $("[name='"+campos[i]+"']");
			}
		}
		if (campo && campo.length > 0 && campo.parents("td").first().find(".aviso").length == 0){
			if ((tipo == "text" && campo.val().trim() == "") || (tipo == "multi" && campo.val() == null) || (tipo == "check" && $("[name='"+campos[i]+"']:checked").length == 0)){
				campo.parents("td").first().append(avisoRequerido())
				application.oCampoFocus = tipo == "text" ? campo : campo.parents("td").first().find(".select2-input")
				contador ++
			}
			if (tipo == "check" && $("[name='"+campos[i]+"']:checked").length == 0){
				
			}
			if (tipo == "numds" && !esNumero(campo.val())){
				campo.parents("td").first().append(avisoNumero())
				application.oCampoFocus = campo;
				contador ++
			}
			if (tipo == "entero" && !esEntero(campo.val())){
				campo.parents("td").first().append(avisoEntero())
				application.oCampoFocus = campo;
				contador ++
			}
			if (tipo == "entero4" && (!esEntero(campo.val()) || campo.val().length != 4)){
				campo.parents("td").first().append(avisoEntero4())
				application.oCampoFocus = campo;
				contador ++
			}
			if (tipo == "alfaNum" && !esAlfaNum(campo.val())){
				campo.parents("td").first().append(avisoAlfaNum())
				application.oCampoFocus = campo;
				contador ++
			}
			if (tipo == "url" && !formatoUrlValido(campo.val())){
				campo.parents("td").first().append(avisoUrl())
				application.oCampoFocus = campo;
				contador ++
			}
			if (tipo == "div" && campo.html() == ""){
				campo.parents("td").first().append(avisoRequerido())
				application.oCampoFocus = campo;
				contador ++
			}
		}
	}
	
	return contador
}

function validarFila(selector, aCampos, aTipos, indice){
	if (indice > 0){
		return true;
	}
	var validar = false;
	$.each(aCampos, function(index){
		if ((aTipos[index] == "text" && $(selector).find("[name='"+this+"']").val() != "") || (aTipos[index] == "multi" && $(selector).find("[name='"+this+"']").val() != null) || (aTipos[index] == "anexos" && $(selector).find("."+this).length > 0)){
			validar = true;
			return false;
		}
	})
	return validar;
}

function isMember(valor, arreglo){
	for (var i = 0; i < arreglo.length; i++){
		if (arreglo[i] == valor){
			return true
		}
	}
	return false
}

function isNotMember(valor, arreglo){
	for (var i = 0; i < arreglo.length; i++){
		if (arreglo[i] == valor){
			return false
		}
	}
	return true	
}

function SelectFromAjaxField(selector, isMultiple, url, clave, tr, maxSize, minimumInputLength){
	$(selector).select2({
		allowClear: true,
        placeholder: "Buscar",
        minimumInputLength: minimumInputLength == 0 ? minimumInputLength : 2,
        multiple: isMultiple,
        maximumSelectionSize : maxSize,
        ajax: { 
            url: url,
            dataType: 'json',        
            data: function (term, page) {
                return {
                    query: term, 
                    page_limit: 40
                };
            },
            results: function (data, page) {
                return {results: data.nodes};
            }
        },
        initSelection: function(element, callback) {
            var val = $(element).val();                        
            if(isMultiple){
                var data = [];
                $(val.split(",")).each(function () {
                	data.push({id: $.trim(this), text: $.trim(this)});                  
                });                
                callback(data);
            }else{
                var data = {id: val, text: val};
                callback(data);                
            }                       
        },
        formatResult: function(node){ 
        	if (!node.msgError){
        		return '<div>' + node.text + '</div>'
        	}else{
        		return '<div>' + node.msgError + '</div>'
            }
        } ,
        formatSelection: function (node) {
        	if(node.id && node.cedula){
        		if (tr){
        			if (clave == "C"){
        				var integrante = $(tr).find("[name='nombreIntegrante']");
        				integrante.val(node.nombre);
        				SelectFromAjaxField(integrante, false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=N', "N", tr);
        			}else if(clave == "A") {        				        				
        				var table = $(tr).parents("table").attr("id");
        				var fila = $(tr).attr("class");
        				var flag = false;
        				$("#"+table+" tbody tr input[name='cedula']").each(function(){
        					if ($(this).val() == node.cedula && fila != $(this).parents("tr").attr("class")) {
        						flag = true;
        					}
        				})
        				if (!flag) {
        					$(tr).find("[name='nombreAsistente']").val(node.nombre);
            				$(tr).find("[name='zonaAsistente']").val(node.zona);
            				$(tr).find("[name='cargoAsistente']").val(node.cargo);
            				$(tr).find("[name='generoAsistente']").val(node.genero);
            				$(tr).find("[name='tipoCargoAsistente']").val(node.tipoCargo);            				
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
            				
        				}else {
        					bAlert("La persona ya se encuentra registrado.", function(){        						
        						$("#"+table+" tbody tr."+fila+ " input[name='cedula']").select2("val", "");
        						$("#"+table+" tbody tr."+fila).find("a.select2-choice").trigger('mousedown');
        					});       					
        				}
        				
        			}else{
        				var cedula = $(tr).find("[name='cedula']");
        				cedula.val(node.cedula);
        				SelectFromAjaxField(cedula, false, application.sWebDbName + 'agBuscarIntegrante?Open&clave=C', "C", tr);
                    }
        			actualizarIntegrantes();
        			$(tr).find("[name='empresa']").val(node.empresa);
        			$(tr).find(".aviso").remove();
                }
        	}
        	return node.id
        },
        dropdownCssClass: "bigdrop",
        escapeMarkup: function (m) { 
        	return m; 
        }
    });   
	$(".select2-choices").addClass("img-rounded").css({"background":"#fff", "margin":"0 0 6px"});
}

function htmlSelect(name, array, multi, att){
	var html;
	if(multi){
		html = "<select name='"+name+"' multiple " + (att ? att : "") + ">";
	}else{
		html = "<select name='"+name+"' " + (att ? att : "") + "><option value=''></option>";
	}
	$.each(array, function (){
		html += "<option value='"+this+"'>"+this;
	})
	html += "</select>";
	return html;
}

function formatoValor(separador, valor){
	if (valor){
		if (valor == ""){
			valor = "xxxx"
		}else{
			valor = valor.replace(/"|â€œ|â€�/g, "'");
			valor = valor.replace(/xxxx/g, "##empty##");
			valor = valor.replace(/&/g, "##ampersand##");
			valor = valor.replace(/@/g, "##arroba##");
			valor = valor.replace(/\r\n|\r|\n/g, "##enter##");
		}
	}else{
		valor = "xxxx"
	}
	return separador + valor
}

function setNumeros(selector){
	$(selector).keyup(function () { 
		var valor = this.value.replace(/[^0-9\.,]/g,'').replace(/\./g, ',')
		valor = valor.substring(0,1) == "," ? "0"+valor : valor;
		if (this.value != valor){
			this.value = valor;
		}
	})
	.blur(function (){
		this.value = formatoNumero(this.value)
	});
}

function pintarGrafica(selector, arr, posY){
	$.plot(selector, arr, {
		series: {
			bars: {
				show: true,
				barWidth: 0.5,
				align: "center",
				showNumbers: true,
	            numbers : {
					xAlign: function(x) { return x; },
	                yAlign: function(y) { return y + posY; }
	            }
			},
			valueLabels: {
				show: true
			}
		},
		xaxis: {
			mode: "categories",
			tickLength: 0
		},
		yaxis: {
			max: 100,
			tickFormatter: function (val, axis) {
				return "<span class=yLabel>" + val + "%</span>";
			}
		},
		valueLabels: {
			show: true
		}
	});
}

function registerPartials(arrParcialTemplates){
	$.each(arrParcialTemplates, function(index, value) {
		Handlebars.registerPartial(value, $("#" + value).html());            
	});                
}

Handlebars.registerHelper('enEdicion', function(options) {  
	if(application.bEdicion) {
		return options.fn(this);  
	}  
	return options.inverse(this);
});

function cargarAnexos(callback){
	var arreglo;
	var seccion;
	var eliminar
	var url = application.sWebDbName + "agCargarAnexos?Open&unique=" + application.sUnique
	$.getJSON(url, function(data){
		if (data.msgError == ""){
			$(".anexos").each(function (){
				arreglo = []
				seccion = $(this).attr("data-seccion")
				if (seccion){
					if ($(this).attr("data-requerido") == "N"){
						eliminar = true
					}else{
						eliminar = false
					}
					$.each(data.anexos, function(){
						if (this.seccion == seccion){
							$.each(this.archivos, function(){
								this.eliminar = eliminar; 
							})
							arreglo = this.archivos
							setImagen(seccion, arreglo[0])
						}
					})
					$(this).html(documento.templateDivAnexo(arreglo));
				}
			})
			if (callback){
				callback()
			}else{
				$("#general").show();
			}
		}else{
			bAlert(data.msgError)
		}
	})
	.error(function(){
		bAlert("OcurriÃ³ un error al procesar los datos. Por favor intente mÃ¡s tarde.")
	})		
}

function anexar(obj){
	var tabla = ""
	var indice = "";
	var unique = application.sUnique;
	var seccion = $(obj).parents(".anexos").first().attr("data-seccion");
	var requerido = $(obj).parents(".anexos").first().attr("data-requerido");
	var tipo = $(obj).parents(".anexos").first().attr("data-tipo");
	var multiple = $(obj).parents(".anexos").first().attr("data-multiple");
	if (!seccion){
		var tr = $(obj).parents("tr").first();
		tabla = tr.parents("table").first().attr("id")
		indice = tr.attr("class");
		unique = tr.find("[name='id']").val();
		seccion = "";
		if (unique == ""){
			unique = application.sUnique
			seccion =  tabla + indice;
		}
	}
	abrirModal(application.sWebDbName + "frAnexo?open&unique=" + unique + "&seccion=" + seccion + "&tabla=" + tabla + "&indice=" + indice + "&tipo=" + tipo + "&requerido=" + requerido + "&multiple=" + multiple, 150)
}

function adicionarAnexo(seccion, tabla, indice, unid, unique, archivo, nombre, requerido, multiple){
	var eliminar = requerido == "S" ? false : true;
	var objeto = {unid:unid, unique:unique, archivo:archivo, nombre:nombre, eliminar:eliminar}
	var selector = "[data-seccion='"+seccion+"']";
	if ($(selector).length == 0){
		selector = $("#"+tabla+" tbody").find("."+indice).find(".anexos");
	}
	if ($(selector).find(".enlaceAnexo").length == 0 || multiple != "S"){
		$(selector).empty().append(documento.templateDivAnexo([objeto]))
		$(selector).next(".aviso").remove();
	}else{
		$(selector).find(".enlaceAnexo").last().after(documento.templateDivEnlaceAnexo(objeto))
	}
	setImagen(seccion, objeto)
}

function setImagen(seccion, objeto){
	switch (seccion){
		case "FOT":
			objeto.clase = "imagenNormal"
			objeto.style = "style=width:"+application.sAnchoFotos+"%"
			$("#dImagen").html(documento.templateImagen(objeto));
			break;
		case "ANT":
			objeto.clase = "imagenAntesDespues";
			$("#dImagenAntes").html(documento.templateImagen(objeto));
			break;
		case "DES":
			objeto.clase = "imagenAntesDespues";
			$("#dImagenDespues").html(documento.templateImagen(objeto));
			break;
	}
}

function eliminarAnexo(obj){
	bConfirm("¿Confirma que desea eliminar el anexo seleccionado?",function(response){
		if(response){
			var unique = $(obj).next("a").attr("id");
			var url = application.sWebDbName + "agEliminarDocumento?Open&unique=" + unique;
			$.getJSON(url, function(data){
				if (data.msgError == ""){
					$(obj).parents("div").first().remove();
					switch (data.seccion){
						case "FOT":
							$("#dImagen").empty();
							break;
						case "ANT":
							$("#dImagenAntes").empty();
							break;
						case "DES":
							$("#dImagenDespues").empty();
							break;
					}
				}else{
					bAlert(data.msgError);
				}
			})
			.error(function(){
				bAlert("No se procesaron los datos. por favor intente mÃ¡s tarde");
			})                
		}
	});
}

jQuery.fn.center = function(parent) {
	if (parent) {
    	parent = this.parent();
	}else{
		parent = window;
    }
	this.css({
    	"position": "absolute",
    	"top": ((($(parent).height() - this.outerHeight()) / 2) + $(parent).scrollTop() + "px"),
    	"left": ((($(parent).width() - this.outerWidth()) / 2) + $(parent).scrollLeft() + "px")
	});
	return this;
}

function ordenFechasValido(fecha1, operador, fecha2){
	var aFecha1 = fecha1.split("/");
	var aFecha2 = fecha2.split("/")
	var dia1 = aFecha1[0];
	var mes1 = aFecha1[1];
	var anio1 = aFecha1[2];
	var dia2 = aFecha2[0];
	var mes2 = aFecha2[1];
	var anio2 = aFecha2[2];
	if(eval("parseFloat(anio1+mes1+dia1)"+operador+"parseFloat(anio2+mes2+dia2)")){
		return true
	}
	return false
}

function validarEnter(e, selector){
	var keynum;

	if(window.event){
		keynum = e.keyCode;
	}else if(e.which){
		keynum = e.which;
	}

	if (keynum == 13){
		$(selector).click();
	}
	return true
}

function bloquearEnter(e){
	var keynum;

	if(window.event){
		keynum = e.keyCode;
	}else if(e.which){
		keynum = e.which;
	}

	if (keynum == 13){
		return false
	}
	return true;
}

function isEnterKey(evt){
	return (getKey(evt)==13)
}

function getKey(evt){
	if (!evt){	
	   evt = window.event;
	}else{
		if (!evt.keyCode){
	 		evt.keyCode = evt.which
		}
	}
	return (evt.keyCode)
}

function clearSelec2MultiValue(campo, clase){
	if ($("[name='"+campo+"']").prop("tagName").toLowerCase() == "select"){
		$("[name='"+campo+"']").val([]).addClass("input-xxlarge").select2({placeholder: "Buscar", allowClear: true});
		$(".select2-choices").addClass("img-rounded");
		
	}else{
		if (window.clearSelec2MultiValueAjax){
			window.clearSelec2MultiValueAjax(campo, clase)
		}
	}
	if (campo == "redApoyo"){
		setRedApoyo(campo)
	}
}

function abrirCostoBen(){
	var url = "/"+application.sRutaCostoBen+"?Open&modal=true&tipo=TP";
	abrirModalLarge(url,"modalLarge")
}

function abrirModalLarge(url, clase, callback){
	if(callback){
		callback();
	}
	setModal(clase)
	$("#dModal .modal-body")
	.html("<iframe id='ifModal' name='ifModal' style='width:100%' frameBorder='no' vspace='0' src='"+url+"'></iframe>")
	.css("height", "100%");
}

function setModal(clase){
	$("#dModal").addClass(clase);
	$("#dModal").modal({backdrop: "static",show: true});
}

function capturarDatos(datos){
	if (application.bEdicion){
		$("[name = totalBeneficio]").val(datos.beneficiosTotales)
		$("[name = beneficioTangible]").val(datos.beneficiosTotales)
		$("[name = energiaElectrica]").val(datos.energiaElectrica)
		$("[name = energiaTermica]").val(datos.energiaTermica)
		$("[name = ahorroAgua]").val(datos.ahorroAgua)
		$("[name = disminucionResiduos]").val(datos.disminucionResiduos)
		$("[name = totalEnergetico]").val(datos.totalAmbiental)
		$("[name = aproResiduos]").val(datos.aproResiduos)
		$("[name = unidBeneficio]").val(datos.unid)
		$("[name = consecutivoBen]").val(datos.consecutivo)
		$("[name = energiaElectricaP]").val(datos.energiaElectricaP)
		$("[name = energiaTermicaP]").val(datos.energiaTermicaP)
		$("[name = ahorroAguaP]").val(datos.ahorroAguaP)
		$("[name = disminucionResiduosP]").val(datos.disminucionResiduosP)
		$("[name = aproResiduosP]").val(datos.aproResiduosP)
		
		enlazarBeneficio(datos.unid,datos.consecutivo)
	}else{
		bAlert("No es posible agregar el resultado de beneficio tangible, porque la pequeÃ±a mejora no esta en ediciÃ³n")
	}
}

function pdfBenModal(){
	window.frames["ifModal"].pdfBen()
}

function nuevaSimulacionModal(){
	window.frames["ifModal"].nuevoDocumento()
}

function abrirExitos(){
	//bAlert(documento.sRutaExitos+"/xaServicios.xsp?Open&accion=postIdeaData&id=" + Math.random())
	$.post("/" + documento.sRutaExitos+"/xaServicios.xsp?Open&accion=postIdeaData&id=" + Math.random(),{
		data: getCamposPM()
	},function(data) {
		if(data.url == ""){
			bAlert("No se encontrÃ³ la ruta de Ã©xitos innovadores, por favor intente mas tarde o comuniquese con el administrador")
		}else{
			location.href = data.url
		}
	}).fail(function(jqXHR) {
		var data = errorRequest(jqXHR)
		if (data.error){
			bAlert(data.Error)
		}
	});
}

function errorRequest(jqXHR) {
	return {
		error : jqXHR.status + " - " + jqXHR.statusText
	}
}

function getCamposPM(){	
	var impactoAmbiental= ""
		
	if(documento.sEnergiaElectrica != "" | documento.sEnergiaTermica !="" | documento.sAhorroAgua !="" | documento.sDisminucionResiduos != "" | documento.sAprobechamiento != ""){
		impactoAmbiental = "Si"
	}	
	var data = [
	            {campo:"form",valor:"frPME"},
	            {campo:"autor",valor:documento.sAutor},
	            {campo:"nombreIdea",valor:documento.sNombreMejora},
	            {campo:"problema",valor:documento.sAntes},
	            {campo:"descripcion",valor:documento.sDespues},
	            {campo:"beneficioTangible",valor:documento.sBenTangible},
	            {campo:"beneficios",valor:documento.sBenIntangible},
	            {campo:"costo",valor:documento.sCostoEstimado},
	            {campo:"fecha",valor:documento.sFechaEstimacion},
	            {campo:"pequenaMejora",valor:"Si"},
	            {campo:"numeroMejora",valor:documento.sConsecutivoPM},
	            {campo:"maquinaProceso",valor:documento.sMaquinaProceso},
	            {campo:"implementada",valor:"Si"},
	            {campo:"maquinaProceso",valor:documento.sMaquinaProceso},
	            {campo:"tipo",valor:documento.sAplicaHorizontal},
	            {campo:"dondeReplica",valor:documento.sAplicaHorizontal=="Replicable"?documento.sLugarReplica:""},
	            {campo:"energiaElectrica",valor:documento.sEnergiaElectrica},
	            {campo:"energiaTermica",valor:documento.sEnergiaTermica},
	            {campo:"ahorroAgua",valor:documento.sAhorroAgua},
	            {campo:"disminucionResiduos",valor:documento.sDisminucionResiduos},
	            {campo:"aproResiduos",valor:documento.sAprobechamiento},
	            {campo:"unidPME",valor:application.sUnid},
	            {campo:"benTotalAmbiental",valor:documento.sTotalEnergetico},
	            {campo:"existePM",valor:documento.sExistePM},
	            {campo:"energiaElectricaP",valor:documento.sEnergiaElectricaP},
	            {campo:"energiaTermicaP",valor:documento.sEnergiaTermicaP},
	            {campo:"ahorroAguaP",valor:documento.sAhorroAguaP},
	            {campo:"disminucionResiduosP",valor:documento.sDisminucionResiduosP},
	            {campo:"aproResiduosP",valor:documento.sAproResiduosP},
	            {campo:"impactoAmbiental",valor:impactoAmbiental}
	            ]
	return JSON.stringify(data);
}

function setModalStyle(){
	parent.$("#dModal .modal-header").removeAttr("style")
	parent.$("#dModal").removeClass("modalLarge")
	parent.$("#dModal .modal-header").html("<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>")
}

function showLoading(){
	$("#loading").center();
	$("#loading").show();
}

function hideLoading(){
	$("#loading").hide();
}

function abrirCargaMasiva() {
	var form = application.sForm;
	var redirectTo = documento.sRedirecTo;
	location.href = application.sWebDbName + "frCargaMasiva?Open&formulario=" + form + "&redirectTo=" + redirectTo + "&id=" + Math.random();
}

function eliminarDocumentosSel(){
	var total = $("[data-name='$$SelectDoc']:checked").length;
	if (total > 0) {
		bConfirm("¿Confirma que desea eliminar los documentos seleccionados?",function(response){
			if(response){
				var idsDocumentos = [];
				var i = -1;
				
				$("[data-name='$$SelectDoc']:checked").each(function(){
					i++;
					idsDocumentos[i] = $(this).val()
				})
				
				var data = {
					idsDocumentos : idsDocumentos ? idsDocumentos : ""
				}
				
				$.post("xaServicios.xsp?accion=eliminarDocumentosSeleccionados", {
					data: JSON.stringify(data)
				}, function(data) {
					if(data.noEliminados.nombre != ""){
						bAlert("Las siguientes documentos se encuentran siendo usados y no es posible su eliminación: "+data.noEliminados.nombre.split(/\r|\n|\r\n/g),function(){
							location.reload();
						});
					}else{
						bAlert("Los datos se han eliminado correctamente.",function(){
							location.reload();
						});
					}
				}).fail(function(jqXHR) {
					bAlert("Erorr al procesar los datos, por favor intente más tarde.",function(){
						location.reload();
					});
				});
			}
		})
	} else {
		bAlert("Debe seleccionar por lo menos un documento.")
	}
}

function colapsar(obj){
	$(obj).attr("src","/icons/collapse.gif")
	var tr =$(obj).parents("tr")
	var padre = tr.attr("class")
	$("[data-padre ='"+padre+"' ]").show()
	$(obj).removeAttr("onclick")
	$(obj).on("click",function(){
		contraer(this)
	})	
}

function contraer(obj){
	$(obj).attr("src","/icons/expand.gif")
	var tr =$(obj).parents("tr")
	var padre = tr.attr("class")
	var hijo = $("[data-padre ='"+padre+"' ]")
	var img = hijo.find("td").first().find("img") 
	img.attr("src","/icons/expand.gif")
	hijo.hide()
	$.each(hijo,function(){		
		contraer($(this).find("td").first().find("img"))
	})
	$(obj).removeAttr("onclick")
	$(obj).on("click",function(){
		colapsar(this)
	})
}
