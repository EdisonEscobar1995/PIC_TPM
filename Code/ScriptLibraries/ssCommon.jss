var $ = function()	{
}

function getWebDbName(){
	return database.getFilePath().replace("\\","/")
}

$.each = function(obj, callback){ /*Método estático*/
	if (null === obj){
		return false;
	}
	for (var x in obj) {	    
		if (obj.hasOwnProperty(x)) {
			callback.call(obj, x, obj[x]);
		}
	}   
}
 
function vectorToArray(vector){
	var array = [];
	
	if(vector){
		if(typeof vector == "string"){
			return  [vector];
		}
		
		var it = vector.iterator();
		while (it.hasNext() ) {
			array.push( it.next() );
		}
			
	}
	
	return array;
}

function headerResponse(contentType, oHeaders){
	// The external context gives access to the servlet environment
	var exCon = facesContext.getExternalContext(); 

	// The writer is the closest you get to a PRINT statement
	// If you need to output binary data, use the stream instead
	var writer = facesContext.getResponseWriter();

	// The servlet's response, check the J2EE documentation what you can do
	var response = exCon.getResponse();

	response.setContentType(contentType);
	$.each(oHeaders, function(key, value){
		response.setHeader(key, value);	 
	})	 
	return writer
}
	 
function footerResponse(writer){
	// We tell the writer we are through
	writer.endDocument();
	facesContext.responseComplete();	 
}

function error(){
	var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
	var respuesta = {error: "Acción no encontrada"};
	writer.write(toJson(respuesta));
	footerResponse(writer)
}

function getRuta(){
	var ruta = "";
	var organizacion = session.getEffectiveUserName();
	organizacion = "*" + organizacion.substring(organizacion.indexOf("/"), organizacion.length);
	var vwRutas:NotesView = database.getView("vwProgRutasOrganizacion");
	var ndRuta:NotesDocument = vwRutas.getDocumentByKey(organizacion, true);
	if (ndRuta != null){
		ruta = ndRuta.getItemValueString("rutaBD");
	}
	return ruta
}

function getUserUrl(){
	var error = "";
	var url = "";
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
		var vwCfg:NotesView = database.getView("vwProgTodos");
		var ndCfg:NotesDocument = vwCfg.getDocumentByKey("frGeneral", true);
		var ruta = getRuta();
		if (ruta != ""){
			url = ndCfg.getItemValueString("host") + "/" + ruta;
		}
	}catch(e){
		error = e.message;
	   	println("Error en getUserUrl: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al obtener la ruta: " + error
		}
		var respuesta = {"url": url, "error": error};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}     
}

function postReporteTotal(){
	var data = fromJson(param.get("data"));
	var error = "";
	var unid = "";
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
			var db:NotesDatabase = sessionAsSigner.getCurrentDatabase()
			var ndReporteTotal:NotesDocument = db.createDocument();
			ndReporteTotal.replaceItemValue("form", "frReporteTotal")
			for (var i = 0; i < data.length; i++){
				
				ndReporteTotal.replaceItemValue(data[i].campo, data[i].valor);
			}
			var item:NotesItem = ndReporteTotal.replaceItemValue("Administrador", "[Administrador]");
			item.setAuthors(true);
			ndReporteTotal.replaceItemValue("unique",ndReporteTotal.getUniversalID());
			ndReporteTotal.save(true, false);
			unid = ndReporteTotal.getUniversalID();
		
	}catch(e){
		error = e.message;
	   	println("Error en postGuardarReporteTotal: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al enviar los datos: " + error
		}
		var respuesta = {"unid": unid, "error": error};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}     
}

function postAbrirDocumentos(){
	var data = fromJson(param.get("data"));
	var error = "";
	var unid = "";
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
			var db:NotesDatabase = sessionAsSigner.getCurrentDatabase()
			var ndAux:NotesDocument = db.createDocument();
			ndAux.replaceItemValue("form", "frAux")
			for (var i = 0; i < data.length; i++){
				ndAux.replaceItemValue(data[i].campo, data[i].valor);
			}
			var item:NotesItem = ndAux.replaceItemValue("Administrador", "[Administrador]");
			item.setAuthors(true);
			ndAux.replaceItemValue("unique",ndAux.getUniversalID());
			ndAux.save(true, false);
			unid = ndAux.getUniversalID();
		
	}catch(e){
		error = e.message;
	   	println("Error en postGuardarReporteTotal: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al enviar los datos: " + error
		}
		var respuesta = {"unid": unid, "error": error};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}     
}

function postReporteRegistroCapacitacion (){
	var data = fromJson(param.get("data"));
	var tipo = data.tipo;
	var datos = {};
	var writer;
	var error = "";
	var unique = "";
	
	try{
		writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"});
		
		if(tipo == "excel"){
			var ndTemp:Notesdocument = sessionAsSigner.getCurrentDatabase().createDocument();
			ndTemp.replaceItemValue("administrador","[Administrador]").setAuthors(true);
			ndTemp.replaceItemValue("form","frReporteTmp");
			ndTemp.replaceItemValue("unique",ndTemp.getUniversalID());
			unique = ndTemp.getUniversalID();
			
			for(i in data.filtros){
				filtro = data.filtros[i];
				ndTemp.replaceItemValue("filtro-"+filtro.campo, filtro.valor);	
			}
			
			ndTemp.save(true, false);
		}else{
			datos = searchCapacitaciones(error, data);
		}
		
	}catch(e){
		error = e.message;
	   	println("Error en postReporteRegistroCapacitacion: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al generar reporte de registro de capacitacion: " + error
		}
		
		var respuesta;
		if(tipo == "excel"){
			respuesta = {error:error, unique:unique};
		}else{
			respuesta = datos;
		}
		
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}     
}

function generarExcelRegistroCapacitaciones(){	
	var unique = param.get("unique");
	var error = "";
	try{
		var db:NotesDatabase = sessionAsSigner.getCurrentDatabase();
		var ndGeneral:NotesDocument = db.getView("vwProgTodos").getDocumentByKey("frGeneral", true);
		var vwUniques:NotesView = db.getView("vwProguniques");
		var ndReporteTmp:NotesDocument = vwUniques.getDocumentByKey(unique, true);
		var capacitacion;
		var datos;
		var data = {filtros: []};
		var valor;
		var campo;
		var ruta;
		
		var writer = headerResponse("application/vnd.ms-excel;charset=UTF-8", {"Cache-Control" : "no-cache",  "Content-Disposition": "Attachment; filename=Reporte_"+database.getTitle()+".xls"});
		writer.write("<!DOCTYPE html>");
	    writer.write("<html>");
	    writer.write("<head>");
	    writer.write("<title>Reporte</title>")
	    writer.write("<meta charset='utf-8'>")
	    
	    writer.write("<style>br {mso-data-placement:same-cell;}.rigth{text-align:right;}th{font-weight:bold;}</style>");
	    writer.write("</head>")
	    writer.write("<body>");
	    
	    if(ndReporteTmp){
	    	
	    	for(item in  ndReporteTmp.getItems()){
	    		if(@Contains(item, "filtro-")){
	    			campo = @ReplaceSubstring(item, "filtro-", "");
	    			valor = vectorToArray(item.getValues());
	    			if(campo != "programa" && campo != "temaCapacitacion"){
		    			valor = valor.length > 1 ? valor: valor[0];
	    			}
	    			
	    			data.filtros.push({campo: campo, valor:valor});
	    		}
	    	}
	    	
	    	datos = searchCapacitaciones(error, data);
	    	
		    if(datos.capacitaciones.length > 0){
		    	writer.write("<div style='text-align:left'><b>Total de registros encontrados "+datos.totalDocumentos+"</b></div>");
			    writer.write("<table border='1'>");
			    writer.write("<thead><tr>" +
					 	"<td>Consecutivo</td>" +
						"<td>Cédula</td>" +
						"<td>Nombre</td>" +
						"<td>Zona (área / dpto)</td>" +
						"<td>Tema capacitación</td>" +
						"<td>Fecha</td>" + 
						"<td>Total horas</td>" +
						"<td>Programa</td>" +
						"<td>Formador</td>" +
						"<td>Año</td>" +
						"<td>Ruta</td>" +
			    		"</tr></thead>");
			    
			    writer.write("<tbody>");
			    
			    for(i in datos.capacitaciones){
			    	capacitacion = datos.capacitaciones[i];
			    	ruta = ndGeneral.getItemValueString("host") + capacitacion.url;
				    writer.write("<tr>");
				    writer.write("<td>"+(capacitacion.consecutivo ? capacitacion.consecutivo: "Sin consecutivo")+"</td>");
					writer.write("<td>"+capacitacion.cedula+"</td>");
				    writer.write("<td>"+capacitacion.nombre+"</td>");
				    writer.write("<td>"+capacitacion.zona+"</td>");
					writer.write("<td>"+capacitacion.temaCapacitacion+"</td>");
					writer.write("<td>"+capacitacion.fecha+"</td>");
					writer.write("<td>"+capacitacion.totalHoras+"</td>");
					writer.write("<td>"+capacitacion.programa+"</td>");
					writer.write("<td>"+capacitacion.formador+"</td>");
					writer.write("<td>"+capacitacion.anio+"</td>");
					writer.write("<td><a target='_blank' href='"+ruta+"'>"+ruta+"</a></td>");
					writer.write("</tr>");
			    }
				
			    writer.write("</tbody>");
		    	writer.write("</table>");
		    }else{
		    	writer.write("<h1>No se encontraron resultados</h1>");
		    }
	    }else{
	    	writer.write("<h1>No se encontraron resultados</h1>");
	    }
	}catch(e){
		error = e.message;
	   	println("Error en generarExcelRegistroCapacitaciones: " + e.message);
	}finally {
		if (error != ""){
			error = "Error al generar el reporte: " + error
			writer.write(error);
		}
		
		if(ndReporteTmp){
			ndReporteTmp.remove(true);
		}
		
		footerResponse(writer)
	}   
}

function searchCapacitaciones(error, data){
	var db:NotesDatabase = sessionAsSigner.getCurrentDatabase();
	var vwRegistroCapacitaciones:NotesView = db.getView("vwProgRegistroCapacitaciones");
	var vwAsistentes:NotesView = db.getView("vwProgCedulaAsistentesRegistroCapacitacion");
	var vec:NotesViewEntryCollection;
	var ve:NotesViewEntry;
	var veAux:NotesViewEntry;
	var nd:NotesDocument;
	var ndAsistente:NotesDocument;
	var ndAux:NotesDocument;
	var dtFecha:NotesDateTime;
	var formato = new java.text.SimpleDateFormat("dd/MM/yyyy");
	var fecha = "";
	var aFecha;
	var filtro;
	var nombreCedula = "";
	var cedula = "";
	var vector:java.util.Vector = new java.util.Vector(1);
	var formulaFecha = "";
	var separadorFecha = "";
	var capacitaciones = [];
	var resultados = 0;
	var formula = "";
	var separador = "";
	
	vector.add(0, "");
	vector.add(1, "");
		
	for(i in data.filtros){
		filtro = data.filtros[i];
		switch(filtro.campo){
			case "nombreCedula":
				nombreCedula = filtro.valor;
			break;
			
			case "programa":
			case "tipoCapacitacion":
				separador += "(";
				for(j in filtro.valor){
					if(typeof j == "string"){
						formula += separador + "["+filtro.campo+"] = " + j;
					}else{
						formula += separador + "["+filtro.campo+"] = " + filtro.valor[j];
					}
					separador = " OR ";
				}
				formula += ")";
				
				separador = " AND ";
			break
			case "fechaInicio":
			case "fechaFin":
				aFecha = filtro.valor.split("/");
				dtFecha = session.createDateTime(new Date(parseInt(aFecha[2],10),parseInt(aFecha[1],10)-1,parseInt(aFecha[0],10)))
				
				if(filtro.campo == "fechaInicio"){
					formulaFecha += separadorFecha + "([fecha] >= " + dtFecha.getDateOnly();						
				}else{
					formulaFecha += separadorFecha + "[fecha] <= " + dtFecha.getDateOnly() + ")";
				}
				
				separadorFecha = " AND ";
			break;
			case "facilitador":				
				formula += separador + "["+filtro.campo+"] CONTAINS " + '"'+filtro.valor+'"';
				separador = " AND ";
			break
			case "temaCapacitacion":
				formula += separador + "["+filtro.campo+"] CONTAINS " + '"*'+filtro.valor+'*"';
				separador = " AND ";
			break
			case "consecutivo":
				formula += separador + "(" + filtro.valor + ")"
				separador = " AND ";
			break
			default:
				formula += separador + "["+filtro.campo+"] = " + filtro.valor;
				separador = " AND ";
			break;
		}
	}
	
	if(formulaFecha){
		formula = formula ? formula + " AND " + formulaFecha : formulaFecha;
	}
		
	if(formula){
		resultados = vwRegistroCapacitaciones.FTSearch(formula, 0);
	}
		
	if(resultados > 0 || !formula){
		resultados = 0;
		nd = vwRegistroCapacitaciones.getFirstDocument();
		while(nd){
			fecha = "";
			cedula = "";
			vector.set(0, nd.getItemValueString("unique"))
			
			if(nd.getItemValue("fecha").elementAt(0) != ""){
				fecha = formato.format(nd.getItemValue("fecha").elementAt(0).toJavaDate())	
			}
		
			if(nombreCedula){
				cedula = nombreCedula.split(" - ");
				vector.set(1, cedula[0])
				ndAsistente = vwAsistentes.getDocumentByKey(vector, true);
				if(ndAsistente){
					resultados ++;
					capacitaciones.push(objAsistente(nd, ndAsistente, fecha, cedula[0]));
				}
			}else{
				vec = vwAsistentes.getAllEntriesByKey(nd.getItemValueString("unique"), true);
				if(vec.getCount() > 0){
					ve = vec.getFirstEntry();
					while(ve){
						resultados ++;
						ndAsistente = ve.getDocument();
						capacitaciones.push(objAsistente(nd, ndAsistente, fecha, ndAsistente.getItemValueString("cedula")));
						veAux = vec.getNextEntry(ve);
						ve.recycle();
						ve = veAux;
					}
				}
			}
			
			ndAux = vwRegistroCapacitaciones.getNextDocument(nd);
			nd.recycle();
			nd = ndAux;
		}
	}
	
	return {capacitaciones: capacitaciones, totalDocumentos: resultados, resultados: (resultados > 0 ? true: false), "error": error};
}

function objAsistente(nd, ndAsistente, fecha, cedula){
	return {
		url:"/"+getWebDbName()+"/0/"+nd.getUniversalID(),
		consecutivo: nd.getItemValueString("consecutivo"),
		cedula: cedula,
		nombre: @Name("[CN]", ndAsistente.getItemValueString("nombre")),
		fecha: fecha,
		temaCapacitacion: nd.getItemValueString("temaCapacitacion"),
		totalHoras: nd.getItemValueString("duracion"),
		programa: nd.getItemValueString("Programa"),
		formador: @Implode(@Name("[CN]", vectorToArray(nd.getItemValue("facilitador"))), "; "),
		anio: nd.getItemValueInteger("anio"),
		zona: ndAsistente.getItemValueString("zona") 
	}
}

function cargarDatosRegistroCapacitacion(){
	var data = fromJson(param.get("data"));
	var error = "";
	var unique = "";
	var tmpConsecutivo = "";
	var aMaestro = [];
	var documentosCreados = 0;
	var capacitacionesCreadas = 0;
	
	try{
		writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"});
		var db:NotesDatabse = sessionAsSigner.getCurrentDatabase();
		var vwTodos:NotesView = db.getView("vwProgTodos");
		var vwMigrados:NotesView = db.getView("vwProgRegistroCapacitacionesMigradas");
		var vwSedes:NotesView = db.getView("vwProgSedes");
		var ndAdmonRegistroC:Notesdocument = vwTodos.getDocumentByKey("frAdmonRegistroCapacitacion", true);
		var nd:Notesdocument;
		var ndAsistente:Notesdocument;
		var ndEstado:NotesDocument;
		var capacitacion;
		var genero = "";
		var orden = 0;
		var guardarMaestro = false;
		var fecha;
		var lastConsecutivo = "";
		var lastAnio = "";
		
		var vwFlujos:NotesView = db.getView("vwProgFormulariosFlujo");
		var ndFlujo:NotesDocument = vwFlujos.getDocumentByKey("frRegistroCapacitacion", true);
	
		var vwEstados:NotesView = db.getView("vwProgEstadosFinales");
		if(ndFlujo){
			ndEstado = vwEstados.getDocumentByKey(ndFlujo.getItemValue("unique"), true);
		}
		
		/*if(data.datos.length > 0){
			vwMigrados.getAllEntries().removeAll(true);
		}*/
		
		if(ndFlujo && ndEstado){
			for(i in data.datos){
				capacitacion = data.datos[i]; 
				if(capacitacion.consecutivo != tmpConsecutivo){
					orden = 0;
					nd = db.createDocument();
					setFlujo(db, nd, ndFlujo, ndEstado);
					nd.replaceItemValue("administrador","[Administrador]").setAuthors(true);
					nd.replaceItemValue("autor", session.getEffectiveUserName()).setNames(true);
					nd.replaceItemValue("form","frRegistroCapacitacion");
					nd.replaceItemValue("keyform","Registro de Capacitaciones");
					nd.replaceItemValue("anio", capacitacion.anio);
					nd.replaceItemValue("consecutivo", setConsecutivo(capacitacion.anio, capacitacion.consecutivo));
					nd.replaceItemValue("coordinador", capacitacion.coordinador);
					nd.replaceItemValue("departamento", capacitacion.departamento);
					nd.replaceItemValue("duracion", capacitacion.duracion);
					nd.replaceItemValue("facilitador", capacitacion.facilitador);
					nd.replaceItemValue("facilitadorIE", capacitacion.facilitadorIE);
					
					if(capacitacion.sede){
						crearSede(db, vwSedes, capacitacion.sede);
					}
					
					nd.replaceItemValue("sede", capacitacion.sede);
					
					if(capacitacion.fecha){
						fecha = textToDate(capacitacion.fecha);
						nd.replaceItemValue("fecha", fecha);
						nd.replaceItemValue("fechaInscripcion", fecha);
					}
					
					nd.replaceItemValue("lugar", capacitacion.lugar);
					nd.replaceItemValue("mes", capacitacion.mes);
					nd.replaceItemValue("programa", capacitacion.programa);
					
					nd.replaceItemValue("temaCapacitacion", capacitacion.temaCapacitacion);
					nd.replaceItemValue("tipoCapacitacion", capacitacion.tipoCapacitacion);
					nd.replaceItemValue("totalAsistentes", capacitacion.totalAsistentes);
					
					nd.replaceItemValue("migrado","S");
					nd.replaceItemValue("unique",nd.getUniversalID());
					unique = nd.getUniversalID();
					
					nd.save(true, false);
					resgistrarHistorico(db, nd);
					capacitacionesCreadas++;
					tmpConsecutivo = capacitacion.consecutivo;
					
					lastConsecutivo = capacitacion.consecutivo;
					lastAnio = capacitacion.anio;
					
				}
				
				ndAsistente = db.createDocument();
				ndAsistente.replaceItemValue("administrador","[Administrador]").setAuthors(true);
				ndAsistente.replaceItemValue("form", "frAsistente");
				
				ndAsistente.replaceItemValue("cedula", capacitacion.cedula);
				ndAsistente.replaceItemValue("nombre", capacitacion.nombre);
				ndAsistente.replaceItemValue("cargo", capacitacion.cargo);
				ndAsistente.replaceItemValue("tipoCargo", capacitacion.tipoCargo);
				
				ndAsistente.replaceItemValue("reentrenamiento", capacitacion.reentrenamiento);
				
				genero = "";
				if(capacitacion.genero){
					if(@LowerCase(capacitacion.genero) == "m"){
						genero = "Masculino";
					}else{
						genero = "Femenino";
					}
				}
				
				ndAsistente.replaceItemValue("genero", genero);
				ndAsistente.replaceItemValue("zona", capacitacion.zona);
				
				
				ndAsistente.replaceItemValue("migrado", "S");
				ndAsistente.replaceItemValue("unique", ndAsistente.getUniversalID());
				ndAsistente.replaceItemValue("uniquePadre", unique);
				ndAsistente.replaceItemValue("orden", orden);
				ndAsistente.save(true, false);
				orden++;
				documentosCreados++;
				
				if(ndAdmonRegistroC){
					if(capacitacion.departamento && capacitacion.departamento != "0" && @IsNotMember(capacitacion.departamento, ndAdmonRegistroC.getItemValue("maestroDepartamento"))){
						aMaestro = vectorToArray(ndAdmonRegistroC.getItemValue("maestroDepartamento"));
						aMaestro.push(capacitacion.departamento);
						ndAdmonRegistroC.replaceItemValue("maestroDepartamento", aMaestro);
						guardarMaestro = true;
					}
					
					if(capacitacion.lugar && @IsNotMember(capacitacion.lugar, ndAdmonRegistroC.getItemValue("maestroLugar"))){
						aMaestro = vectorToArray(ndAdmonRegistroC.getItemValue("maestroLugar"));
						aMaestro.push(capacitacion.lugar);
						ndAdmonRegistroC.replaceItemValue("maestroLugar", aMaestro);
						guardarMaestro = true;
					}
					
					if(capacitacion.programa && @IsNotMember(capacitacion.programa, ndAdmonRegistroC.getItemValue("maestroPrograma"))){
						aMaestro = vectorToArray(ndAdmonRegistroC.getItemValue("maestroPrograma"));
						aMaestro.push(capacitacion.programa);
						ndAdmonRegistroC.replaceItemValue("maestroPrograma", aMaestro);
						guardarMaestro = true;
					}
					
					/*Comentado porque se estan cargando muchos temas de capacitación haciendo que el campo reviente
					if(capacitacion.temaCapacitacion && @IsNotMember(capacitacion.temaCapacitacion, ndAdmonRegistroC.getItemValue("maestroTemaCapacitacion"))){
						aMaestro = vectorToArray(ndAdmonRegistroC.getItemValue("maestroTemaCapacitacion"));
						aMaestro.push(capacitacion.temaCapacitacion);
						ndAdmonRegistroC.replaceItemValue("maestroTemaCapacitacion", aMaestro);
						guardarMaestro = true;
					}*/
					
					if(capacitacion.tipoCapacitacion && @IsNotMember(capacitacion.tipoCapacitacion, ndAdmonRegistroC.getItemValue("maestroTipoCapacitacion"))){
						aMaestro = vectorToArray(ndAdmonRegistroC.getItemValue("maestroTipoCapacitacion"));
						aMaestro.push(capacitacion.tipoCapacitacion);
						ndAdmonRegistroC.replaceItemValue("maestroTipoCapacitacion", aMaestro);
						guardarMaestro = true;
					}
					
					if(guardarMaestro){
						ndAdmonRegistroC.save(true, false);
					}
				}
			}
			
			actualizarAdmonConsecutivo(db, lastConsecutivo, lastAnio);
		}else{
			error = "No se identificó flujo para cargar los documentos";
		}
		
	}catch(e){
		error = e.message;
	   	println("Error en cargarDatosRegistroCapacitacion: " + e.message);
	}finally {
		if (error != ""){
			error = "Error al cargar datos de registro de capacitación: " + error
		}
		
		var respuesta = {error:error, documentosCreados:documentosCreados, capacitacionesCreadas: capacitacionesCreadas};
		
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}     
}

function textToDate(fecha){
	var anio = @Left(fecha, 4);
	var mes = @Right(@Left(fecha, 6), 2);
	var dia = @Right(fecha, 2);
	
	if(anio && mes && dia){
		return session.createDateTime(new Date(parseInt(anio,10),parseInt(mes,10)-1,parseInt(dia,10)))
	}
	
	return "";
}

function crearSede(db, vwSedes, sede){
	var ndSede:NotesDocument = vwSedes.getDocumentByKey(sede, true);

	if(!ndSede){
		ndSede = db.createDocument();
		ndSede.replaceItemValue("administrador","[Administrador]").setAuthors(true);
		ndSede.replaceItemValue("form","frSede");
		ndSede.replaceItemValue("keyform","Configuración sede");
		ndSede.replaceItemValue("nombre", sede);
		ndSede.replaceItemValue("roles", "");
		ndSede.replaceItemValue("migrado", "S");
		ndSede.save(true, false);
	}
}

function setFlujo(db, nd, ndFlujo, ndEstado){
	var fecha:NotesDateTime = session.createDateTime(new Date());
	nd.replaceItemValue("uniqueFlujo", ndFlujo.getItemValue("unique"));
	nd.replaceItemValue("uniqueEstado", ndEstado.getItemValue("unique"));
	nd.replaceItemValue("posEstado", ndEstado.getItemValue("posEstado"));
	nd.replaceItemValue("estado", ndEstado.getItemValue("nombre"));
	nd.replaceItemValue("responsable", "").setNames(true);
	nd.replaceItemValue("editores", "").setAuthors(true);
	nd.replaceItemValue("fechaEstado", fecha);
	nd.replaceItemValue("fechaInscripcion", fecha);
}

function setConsecutivo(anio, consecutivo){
	if(consecutivo){
		consecutivo = anio + @Right("000"+consecutivo, 4);	
	}
	
	return consecutivo;
}

function resgistrarHistorico(db, nd){
	var fecha:NotesDateTime = session.createDateTime(new Date());
	var ndHistorico:NotesDocument = db.createDocument();
	ndHistorico.replaceItemValue("administrador","[Administrador]").setAuthors(true);
	ndHistorico.replaceItemValue("autor", session.getEffectiveUserName()).setNames(true);
	ndHistorico.replaceItemValue("editor","*").setAuthors(true);
	ndHistorico.replaceItemValue("form", "frHistorico");
	ndHistorico.replaceItemValue("accion", "Documento migrado desde archivo excel");
	ndHistorico.replaceItemValue("fecha", fecha);
	ndHistorico.replaceItemValue("uniqueEstadoDestino", "");
	ndHistorico.replaceItemValue("uniqueEstadoOrigen", "");
	ndHistorico.replaceItemValue("uniquePadre", nd.getItemValueString("unique"));
	ndHistorico.replaceItemValue("migrado", "S");
	ndHistorico.save(true, false);
}

function actualizarAdmonConsecutivo(db, consecutivo, anio){
	var vwConsecutivos:NotesView = db.getView("vwProgConsecutivosPlantilla");
	var ndConsecutivo:NotesDocument = vwConsecutivos.getDocumentByKey("frRegistroCapacitacion", true);
	var anioTmp = @Year(@Now());
	
	if(!ndConsecutivo){
		ndConsecutivo = db.createDocument();
		ndConsecutivo.replaceItemValue("administrador","[Administrador]").setAuthors(true);
		ndConsecutivo.replaceItemValue("editor","*").setAuthors(true);
		ndConsecutivo.replaceItemValue("form", "frConsecutivo");
		ndConsecutivo.replaceItemValue("plantilla", "frRegistroCapacitacion");
		ndConsecutivo.replaceItemValue("anio", anio);
	}
	
	if(anioTmp == parseInt(anio,10)){
		ndConsecutivo.replaceItemValue("consecutivo", parseInt(consecutivo, 10));
	}else{
		ndConsecutivo.replaceItemValue("consecutivo", 1);
	}
	
	ndConsecutivo.save(true, false);
	
}

function asociarAccion(){
	var ruta = param.get("ruta");
	var negocio = param.get("negocio");
	var idAccion = param.get("idAccion");
	var unique = param.get("unique");
	var datosAccion = {};
	var error = "";
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
			var db:NotesDatabase = sessionAsSigner.getCurrentDatabase();
			var dbConexion:NotesDatabase;
			var vwTodos:NotesView = db.getView("vwProgTodos");
			var vwIds:NotesView;
			var ndGeneral:NotesDocument = vwTodos.getDocumentByKey("frGeneral", true);
			var ndAccion:NotesDocument;
			var ndNegocio:NotesDocument;
			var ndAux:NotesDocument;
			var consecutivoAccion = "Ver acción";
			var descAccion = "Accion";
			var descripcionAccion = "";
			var url = "";
			
			ruta = @LowerCase(ruta);
			dbConexion = sessionAsSigner.getDatabase("", ruta);
			vwIds = dbConexion.getView("vwProgIds");
			ndNegocio = vwIds.getDocumentByKey(negocio, true);
			if(ndNegocio){
				if(ndNegocio.getItemValueString("ruta") != ndGeneral.getItemValueString("rutaBdConexion")){
					dbConexion = sessionAsSigner.getDatabase("", ndNegocio.getItemValueString("ruta"));
				}
				
				if(dbConexion.isOpen()){
					vwIds = dbConexion.getView("vwProgIds");
					ndAccion = vwIds.getDocumentByKey(idAccion, true);
					if(ndAccion){
						ndAccion.replaceItemValue("TPM", "Si");
						ndAccion.replaceItemValue("uniquePadreTPM", unique);
						ndAccion.replaceItemValue("plantillaAnalisis", "crearHerramientaAnalisisTPM");
						ndAccion.replaceItemValue("rutaHATPM",getWebDbName());
						ndAccion.replaceItemValue("idHATPM", unique);
						ndAccion.save(true, false);
						
						consecutivoAccion = consecutivoAccion + " " + ndAccion.getItemValueString("consecutivo");
						url = "/"+ruta+"/xfAccion.xsp?documentId="+ndAccion.getUniversalID()+"&action=editDocument&modalTPM=true"
						descripcionAccion = "<span class='idAccion'><a id='"+ndAccion.getUniversalID()+"' href='javascript:void(0)' onclick='abrirModalLarge(\""+ url +"\",\"modalLarge\", showLoading)'>"+consecutivoAccion+"</a></span>"
						datosAccion = objAccion(dbConexion, ndAccion, descripcionAccion, consecutivoAccion);
						
					}else{
						error = "No se encontró la acción asociada, por favor intentar más tarde o comunicarse con el administrador";
					}
				}else{
					error = "No es posible conectarse con la base de datos que tiene la acción seleccionada";
				}
			}
	}catch(e){
		error = e.message;
	   	println("Error en asociar acción: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al asociar acción: " + error
		}
		
		var respuesta = {"datosAccion": datosAccion, "error": error};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}
}

function objAccion(dbConexion, ndAccion, descripcionAccion, consecutivoAccion){
	return {
		descAccion : descripcionAccion ,
		descAccionTexto : consecutivoAccion ,
		unidAccion : ndAccion.getUniversalID(),
		dbOrigen : "CONEXION",
		actividades : getActividades(dbConexion, ndAccion)
	}
}

function getActividades(dbConexion, ndAccion){
	var vwActividades:NotesView = dbConexion.getView("vwProgActividadesIdPadre");
	var vec:NotesViewEntryCollection;
	var ve:NotesViewEntry;
	var veAux:NotesViewEntry;
	var ndActividad:NotesDocument;
	var formato = new java.text.SimpleDateFormat("dd/MM/yyyy");
	var fechaImplementacion = "";
	var actividades = [];
	var uniquePadreTPM, idConexion;
	var objActividadTPM;
	var correccion = "";
	
	vec = vwActividades.getAllEntriesByKey(ndAccion.getItemValueString("id"), true)
	ve = vec.getFirstEntry();
	while(ve){
		ndActividad = ve.getDocument();
		correccion = "";
		fechaImplementacion = "";
		if(ndActividad.hasItem("fechaImplementacion")){
			fechaImplementacion = formato.format(ndActividad.getItemValue("fechaImplementacion").elementAt(0).toJavaDate()); 
		}
	
		if(ndActividad.getItemValueString("tipoAccion") == "Correctiva"){
			correccion = @Implode(ndActividad.getItemValue("correccion"), "<br>");	
		}
		
		uniquePadreTPM = ndAccion.getItemValueString("uniquePadreTPM");
		idConexion = ndActividad.getItemValueString("id");
		objActividadTPM = getActividadTPM(uniquePadreTPM, idConexion);
		
		actividades.push({
			unique:objActividadTPM.unique,
			numero:objActividadTPM.numero,
			idConexion: idConexion,
			actividad: ndActividad.getItemValueString("actividad"),
			correccion: correccion,
			tipoAccion: ndActividad.getItemValueString("tipoAccion"),
			responsable: @Name("[ABBREVIATE]", ndActividad.getItemValueString("responsableActividad")),
			fechaImplementacion: fechaImplementacion,
			estado: ndActividad.getItemValueString("estado")
		});
		veAux = vec.getNextEntry(ve);
		ve.recycle();
		ve = veAux;
	}
	
	return actividades;
}

function getActividadTPM(uniquePadre, idConexion){
	var vwActividades:NotesView = sessionAsSigner.getCurrentDatabase().getView("vwProgActividadesIdConexion");
	var ndAux:NotesDocument;
	var vector:java.util.Vector = new java.util.Vector(1);
	var obj = {unique:"", numero: ""};
	
	vector.add(0, uniquePadre);
	vector.add(1, idConexion);
	
	ndAux = vwActividades.getDocumentByKey(vector, true);
	if(ndAux){
		obj.unique = ndAux.getItemValueString("unique");
		obj.numero = ndAux.getItemValueString("numero");
	}
	
	return obj;
}

function cargarAcciones(){
	var aplicaSIG = param.get("aplicaSIG");
	var unique = param.get("unique");
	var acciones = [];
	var datosAccion = {};
	var error = "";
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
		var db:NotesDatabase = sessionAsSigner.getCurrentDatabase();
		var dbConexion:NotesDatabase;
		var vwTodos:NotesView = db.getView("vwProgTodos");
		var vwAcciones:NotesView;
		var vwIds:NotesView;
		var vec:NotesViewEntryCollection;
		var ve:NotesViewEntry;
		var veAux:NotesViewEntry;
		var ndGeneral:NotesDocument = vwTodos.getDocumentByKey("frGeneral", true);
		var ndAccion:NotesDocument;
		var formato = new java.text.SimpleDateFormat("dd/MM/yyyy");
		var fechaImplementacion;
		var consecutivoAccion = "Ver acción";
		var descAccion = "";
		var descripcionAccion = "";
		var ruta = "";
		var url = "";
		var unid, enlaceAccion;
		var numCausaRaiz;
			
		if(aplicaSIG == "Si"){
			dbConexion = sessionAsSigner.getDatabase("", ndGeneral.getItemValueString("rutaBdConexion"));
			ruta = ndGeneral.getItemValueString("rutaBdConexion");
			vwAcciones = dbConexion.getView("vwProgAccionesUniquePadreTPM");
		}else{
			vwAcciones = db.getView("vwProgAccionesUniquePadreTPM");
		}	
		
		vec = vwAcciones.getAllEntriesByKey(unique, true);
		ve = vec.getFirstEntry();
		while(ve){
			ndAccion = ve.getDocument();
			
			if(aplicaSIG == "Si"){
				consecutivoAccion = consecutivoAccion + " " + ndAccion.getItemValueString("consecutivo");
				url = "/"+ruta+"/xfAccion.xsp?documentId="+ndAccion.getUniversalID()+"&action=editDocument&modalTPM=true"
				descripcionAccion = "<span class='idAccion'><a id='"+ndAccion.getUniversalID()+"' href='javascript:void(0)' onclick='abrirModalLarge(\""+ url +"\",\"modalLarge\", showLoading)'>"+consecutivoAccion+"</a></span>"
				acciones.push(objAccion(dbConexion, ndAccion, descripcionAccion, consecutivoAccion));
			}else{
				fechaImplementacion = "";
				if(ndAccion.hasItem("fechaEjecucion")){
					fechaImplementacion = formato.format(ndAccion.getItemValue("fechaEjecucion").elementAt(0).toJavaDate()); 
				}
				
				if(ndAccion.getItemValueString("accionDescripcion") != ""){
					descAccion = @Trim(@Implode(ndAccion.getItemValue("accionDescripcion"), "<br>"))				
				}else{
					descAccion = "Sin descripción"		
				} 
			
			
				if(ndAccion.getItemValueString("numeroCausaRaiz") != ""){
					numCausaRaiz = ndAccion.getItemValueString("numeroCausaRaiz")
				}else{
					numCausaRaiz="Sin causa raíz"
					
				} 
				
				unid = ndAccion.getUniversalID()
				url = "/"+getWebDbName()+"/0/"+unid+"?Open&modal=true";
				enlaceAccion = "<span class='idAccion'><a href='javascript:void(0)' onclick='abrirModalLarge(\""+ url +"\",\"modalLarge\", showLoading)'>" +descAccion+ "</a><br></span>"
				
				acciones.push({
					indice : numCausaRaiz,
					accion : enlaceAccion,
					descAccion: enlaceAccion,
					descAccionTexto: descAccion,
					esTableAccion: ndAccion.getItemValueString("esTableAccion"),
					unidAccion : unid, 
					tipoAccion : ndAccion.getItemValueString("tipoAccion"),
					responsable: @Name("[ABBREVIATE]", ndAccion.getItemValueString("responsable")),
					responsableAccion: @Name("[ABBREVIATE]", ndAccion.getItemValueString("responsables")),
					fechaImplementacion : fechaImplementacion,
					estado : ndAccion.getItemValueString("estado")
				});
				
			}
			
			veAux = vec.getNextEntry(ve);
			ve.recycle();
			ve = veAux;
		}
		
	}catch(e){
		error = e.message;
	   	println("Error en cargar acciones: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al cargar acciones: " + error
		}
		
		var respuesta = {"acciones": acciones, "error": error};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}
}

function guardarActividades(){
	var data = fromJson(param.get("data"));
	var error = "";
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
		var db:NotesDatabase = sessionAsSigner.getCurrentDatabase();
		var vwActividades:NotesView = db.getView("vwProgActividades");
		var vwUniques:NotesView = db.getView("vwProgUniques");
		var dc:NotesDocumentCollection;
		var ndActividad:NotesDcoument;
		var ndAux:NotesDocument;
		var actividad; 
		var uniquePadre = data.uniquePadre;
	
		dc = vwActividades.getAllDocumentsByKey(uniquePadre, true);
		
		for(i in data.actividades){
			actividad = data.actividades[i];
			ndAux = null;
			ndActividad = vwUniques.getDocumentByKey(actividad.unique, true);
			if(ndActividad){
				ndAux = dc.getDocument(ndActividad); 
			}
			
			if(ndAux){
				dc.deleteDocument(ndActividad);
			}else{
				ndActividad = db.createDocument();
				ndActividad.replaceItemValue("form", "frActividad");
				ndActividad.replaceItemValue("administrador", "[Administrador]").setAuthors(true);
				ndActividad.replaceItemValue("unique", ndActividad.getUniversalID());
				ndActividad.replaceItemValue("uniquePadre", uniquePadre);
				ndActividad.replaceItemValue("posicion", actividad.posicion);
			}
			
			ndActividad.replaceItemValue("idConexion", actividad.idConexion);
			ndActividad.replaceItemValue("numero", actividad.numero);
			ndActividad.save(true, false);
		}
		
		dc.removeAll(true);
	}catch(e){
		error = e.message;
	   	println("Error al guardar actividades: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al guardar actividades: " + error
		}
		
		var respuesta = {"error": error};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}
}

function guardarMasivo() {
	var data = fromJson(param.get("data"));
	var error = "";
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
		var db:NotesDatabase = sessionAsSigner.getCurrentDatabase();
		// var nombres = @Explode(@ReplaceSubstring(viewScope.get("nombres"),"\r",""),"\n"); 
		var vwNombres:NotesView = sessionAsSigner.getCurrentDatabase().getView("vwProgNombres");
		var vwUniques:NotesView = sessionAsSigner.getCurrentDatabase().getView("vwProgUniques");
		var ndAux:NotesDocument;
		var ndDoc:NotesDocument;
		var form = data.form;
		var nombres = data.entradas;
		var item:NotesItem;
		
		// var ndc:NotesDocumentCollection = vwNombres.getAllDocumentsByKey(form,true);
		// ndc.removeAll(true);
		var nd:NotesDocument;
		
		if (form == "frTipoCertificacion" || form == "frHabilidad") {
			vwNombres = sessionAsSigner.getCurrentDatabase().getView("vwProgNomClavesTipoCertificacionHabilidad");
		}
		
		var ndMaestro:NotesDocument = null
		var vector:java.util.Vector = new java.util.Vector(2);
		vector.add(0,form);
		vector.add(1,"");
		
		if (form == "frTipoCertificacion") {
			vector = new java.util.Vector(3);
			vector.add(0,form);
			vector.add(1,"");
			vector.add(2,"");
		}
		
		if (form == "frHabilidad") {
			vector = new java.util.Vector(4);
			vector.add(0,form);
			vector.add(1,"");
			vector.add(2,"");
			vector.add(3,"");
		}
		
		vwNombres.setAutoUpdate(true);
		var item:NotesItem;
		for (var i =0;i<nombres.length;i++){		
			vector.setElementAt(nombres[i],1);
			if (form == "frTipoCertificacion") {
				vector.setElementAt(nombres[i],1);
				vector.setElementAt(data.certificacion,2);
			}
			
			if (form == "frHabilidad") {
				vector.setElementAt(nombres[i],1);
				vector.setElementAt(data.certificacion,2);
				vector.setElementAt(data.tipoCertificacion,3);
			}
			
			ndAux = vwNombres.getDocumentByKey(vector,true);
			if(!ndAux){
				ndMaestro = database.createDocument();			
				ndMaestro.replaceItemValue("form",form);
				item = ndMaestro.replaceItemValue("Administrador", "[Administrador]");
				item.setAuthors(true);
				ndMaestro.replaceItemValue("unique",ndMaestro.getUniversalID());
				ndMaestro.replaceItemValue("nombre",nombres[i].trim());
				if (form == "frTipoCertificacion") {
					ndDoc = vwUniques.getDocumentByKey(data.certificacion);
					if (ndDoc) {
						ndMaestro.replaceItemValue("nomCertificacion",ndDoc.getItemValueString("nombre"));
						ndMaestro.replaceItemValue("certificacion",data.certificacion);
					}
				}
				if (form == "frHabilidad") {
					ndDoc = vwUniques.getDocumentByKey(data.certificacion);
					if (ndDoc) {
						ndMaestro.replaceItemValue("nomCertificacion",ndDoc.getItemValueString("nombre"));
						ndMaestro.replaceItemValue("certificacion",data.certificacion);
						ndDoc.recycle();
					}
					ndDoc = vwUniques.getDocumentByKey(data.tipoCertificacion);
					if (ndDoc) {
						ndMaestro.replaceItemValue("nomTipoCertificacion",ndDoc.getItemValueString("nombre"));
						ndMaestro.replaceItemValue("tipoCertificacion",data.tipoCertificacion);
						ndDoc.recycle();
					}
					ndMaestro.replaceItemValue("aplicaValidacionEvaluacion",data.aplicaValidacionEvaluacion);
					var personas = [];
					var names = data.certificadores[i];
        	    	for(var j in  names){
	               	    nombre = session.createName(names[j]);
	               	  	personas.push(nombre.getCanonical())	               	         		
        	    	}
        	    	item = ndMaestro.replaceItemValue("certificadores", personas);
              	    item.setNames(true);
              	    item.recycle();
				}
				ndMaestro.computeWithForm(false,false);
				ndMaestro.save(true,false);
				ndMaestro.recycle();	
			}			
		}
		
		if (database.isFTIndexed()){
			sessionAsSigner.getCurrentDatabase().updateFTIndex(false);
		}
	}catch(e){
		error = e.message;
	   	println("Error al guardar maestro masivo: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al guardar maestro masivo: " + error
		}
		
		var respuesta = {"error": error};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}
}

function getTipoCertificaciones(){
	var certificacion = param.get("certificacion");
	var tipoCertificaciones = [];
    
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
		tipoCertificaciones = getListaTipoCertificaciones(certificacion);
	}catch(e){
		error = e.message;
	   	println("Error en getTipoCertificaciones: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al otener los tipo de certificaciones: " + error
		}
		
		var respuesta = {tipoCertificaciones: tipoCertificaciones};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}
}

function getEstadosPorForm(){
	var form = param.get("form");
	var estados = [];
    
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
		estados = getListaEstadosPorForm(form);
	}catch(e){
		error = e.message;
	   	println("Error en getEstadosPorForm: " + e.message);
	}finally {
		if (error != ""){
			error: "Error al otener los estados por formulario: " + error
		}
		
		var respuesta = {estados: estados};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}
}

function getListaTipoCertificaciones(certificacion){
	var tipos = [];
	var vwTipoCertificaciones:NotesView = sessionAsSigner.getCurrentDatabase().getView("vwProgTipoCertificacionesCertificacion");
	var vec:NotesViewEntryCollection = vwTipoCertificaciones.getAllEntriesByKey(certificacion, true);
	var ve:NotesViewEntry = vec.getFirstEntry();
	var veAux:NotesViewEntry;
	var ndTipoCertificacion:NotesDocument;
	
	while (ve != null){
		veAux = vec.getNextEntry(ve)
		ndTipoCertificacion = ve.getDocument();
		tipos.push({
			nombre:ndTipoCertificacion.getItemValueString("nombre"),
			codigo:ndTipoCertificacion.getItemValueString("unique")
		});
		
		ndTipoCertificacion.recycle()
		ve.recycle();
		ve = veAux;
	}
	return tipos;
}

function getListaEstadosPorForm(form){
	var estados = [];
	var vwTodos:NotesView = sessionAsSigner.getCurrentDatabase().getView("vwProgTodos");
	var vwEstadosFlujo:NotesView = sessionAsSigner.getCurrentDatabase().getView("vwProgEstadosFlujo");
	var ndDoc:NotesDocument;
	var vec:NotesViewEntryCollection;
	var ve:NotesViewEntry;
	var veAux:NotesViewEntry;
	var ndEstado:NotesDocument;
	
	ndDoc = vwTodos.getDocumentByKey(form, true);
	
	if (ndDoc) {
		vec = vwEstadosFlujo.getAllEntriesByKey(ndDoc.getItemValueString("uniqueFlujo"), true);
		ve = vec.getFirstEntry();
		while (ve != null){
			veAux = vec.getNextEntry(ve)
			ndEstado = ve.getDocument();
			estados.push({
				nombre:ndEstado.getItemValueString("nombre"),
				id:ndEstado.getItemValueString("unique")
			});
			
			ndEstado.recycle();
			ve.recycle();
			ve = veAux;
		}
	}
	return estados;
}

function eliminarDocumentosSeleccionados(){
	var data = fromJson(param.get("data"));
	var idsDocumentos = data.idsDocumentos;
	
	var error = "";
	var noEliminar = {
		nombre: ""
	};
	
	try{
	var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
	var vwUniques:NotesView = sessionAsSigner.getCurrentDatabase().getView("vwProgUniques");
	
	for(i=0;i<idsDocumentos.length;i++){
		var ndDoc:NotesDocument = vwUniques.getDocumentByKey(idsDocumentos[i],true);
	
		if(ndDoc){
			// if(ndDoc.getItemValueString("posEstado") == "I"){
				ndDoc.remove(true);
				ndDoc.recycle();
			// }else{
				// noEliminar.nombre = ndDoc.getItemValueString("TAREA");
			// }
		}
	}
	}catch(e){
		error = e.message;
	   	println("Error en eliminarDocumentosSeleccionados: " + e.message);
	}finally {
		if (error != ""){
			error = "Error al los documentos seleccionados: " + error
		}
		var respuesta = {error: error, noEliminados: noEliminar};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}
}

function cargarCertificacionesPendientes(){
	var usuario = param.get("usuario");
	var error = "";
	
	try{
		var writer = headerResponse("application/json;charset=UTF-8", {"Cache-Control" : "no-cache"})
		var vwTodos:NotesView = sessionAsSigner.getCurrentDatabase().getView("vwProgTodos");
		var ndGeneral:NotesDocument = vwTodos.getDocumentByKey("frGeneral", true);
		var ruta = @LowerCase(sessionAsSigner.getDatabase("", ndGeneral.getItemValueString("rutaEvaluacionesCertificaciones")));
		var dbTPMEC:NotesDatabase = sessionAsSigner.getDatabase("", ruta);
		var vwCertificaciones:NotesView;
		var vec:NotesViewEntryCollection;
		var ve:NotesViewEntry; 
		var veAux:NotesViewEntry;
		var ndCertificacion:NotesDocument;
		var certificaciones = [];
		var resultados = 0;
		
		if(dbTPMEC.isOpen()){
			vwCertificaciones = dbTPMEC.getView("vwMisCertificacionesPendientes");
			vec = vwCertificaciones.getAllEntriesByKey(usuario, true);
			
			if(vec.getCount() > 0){
				ve = vec.getFirstEntry();
				while(ve){
					resultados ++;
					ndCertificacion = ve.getDocument();
					certificaciones.push({
						sede: ndCertificacion.getItemValueString("sede"),
						habilidadCertificada: @Implode(vectorToArray(ndCertificacion.getItemValue("nombreHabilidadCertificada")), "<br>"),
						certificacion: @Implode(vectorToArray(ndCertificacion.getItemValue("nombreCertificacion")), "<br>"),
						certificadoPor: @Implode(@Name("[CN]", vectorToArray(ndCertificacion.getItemValue("certificadoPor"))), "<br>"),
						estado: ndCertificacion.getItemValueString("estado"),
						ruta: "/"+ruta+"/0/" + ndCertificacion.getUniversalID()
					});
					veAux = vec.getNextEntry(ve);
					ve.recycle();
					ve = veAux;
				}
			}
		}
	}catch(e){
		error = e.message;
	   	println("Error en cargarCertificacionesPendientes: " + e.message);
	}finally {
		if (error != ""){
			error = "Error al cargar certificaciones pendientes: " + error
		}
		var respuesta = {error: error, certificaciones: certificaciones, resultados: (resultados > 0 ? true: false)};
		writer.write(toJson(respuesta));
		footerResponse(writer)
	}	
}

function SolucionesAdmonLog(){
	//Log Soluciones Administrativas 2025May30
	var usuario = session.getEffectiveUserName() ;	
	//println("Soluciones Admon Log................." + usuario)
	
	if(usuario==""){
		break;
	}
	
	var cedula = "";
	var cia = "";

	var docN:NotesDocument;
	var docP:NotesDocument;
	var docC:NotesDocument;
	var docCategoria:NotesDocument;
	var aux;
	var ruta="";
	
	
	var fechaCreacion:NotesDateTime = session.createDateTime(new Date());	
	var dbDirectorio:NotesDatabase = sessionAsSigner.getDatabase("", "dnbdDirectorio.nsf");
	var vwUsuarios:NotesView = dbDirectorio.getView("($Users)");
	var ndUsuario:NotesDocument = vwUsuarios.getDocumentByKey(usuario, true);
	
	var dbNomina:NotesDatabase = sessionAsSigner.getDatabase("", "aplicaciones\\directorios\\dnbdNomina.nsf");
	var vwPersonasNomina:NotesView = dbNomina.getView("dnvwFVCedula");
	var vwCia:NotesView = dbNomina.getView("dnvwCompaniasCodigo");
	
	var dbLog:NotesDatabase = sessionAsSigner.getDatabase("", "aplicaciones\\dnbdSolucionesAdmonLog.nsf");
	var vwCategoria:NotesView = dbLog.getView("dnvwCategoriabd");
	ruta = database.getFilePath().toLowerCase();
	
	var docN = dbLog.createDocument();
	var id = session.evaluate("@unique", docN);
	docN.replaceItemValue("docid",id[0]);
	docN.replaceItemValue("Form","dnfrmLog");
	docN.replaceItemValue("dnfdBD", database.getTitle());
	docN.replaceItemValue("dnfdBD1", ruta);
	docN.replaceItemValue("dnfdFecha", fechaCreacion);
	docN.replaceItemValue("dnfdUsuario", usuario);
	//println("usuario=" + usuario);

	if(ndUsuario){
		cedula = ndUsuario.getItemValue("EmployeeID");
		docN.replaceItemValue("dnfdCedula",cedula);
		
		docP = vwPersonasNomina.getDocumentByKey(cedula, true);
		if(docP){
			cia = docP.getItemValue("dnfdCiaCorto");
			docC = vwCia.getDocumentByKey(cia, true);
			if(docC){
				docN.replaceItemValue("dnfdCia", docC.getItemValue("dnfdCia"));
				docN.replaceItemValue("dnfdPais", docC.getItemValue("dnfdPais"));
				docN.replaceItemValue("dnfdNegocio", docC.getItemValue("dnfdNegocio"));
			}else{
				docN.replaceItemValue("dnfdCia", ndUsuario.getItemValue("CompanyName"));
				docN.replaceItemValue("dnfdPais","-");
				docN.replaceItemValue("dnfdNegocio", "-");
			}
		}else{
			docN.replaceItemValue("dnfdCia", ndUsuario.getItemValue("CompanyName"));
			docN.replaceItemValue("dnfdPais","-");
			docN.replaceItemValue("dnfdNegocio", "-");			
		}
				// usuario del directorio general
	} else{		
		docN.replaceItemValue("dnfdCia", "NoDirectorio");
		docN.replaceItemValue("dnfdPais","-");
		docN.replaceItemValue("dnfdNegocio", "-");
	}
	
	aux = ruta.split("\\");
	docN.replaceItemValue("dnfdCarpeta",aux[1]);		
	
	docCategoria = vwCategoria.getDocumentByKey(ruta, true);
	if(docCategoria){
		docN.replaceItemValue("dnfdCategoria",docCategoria.getItemValue("dnfdEtiqueta"));
	}else{
		docN.replaceItemValue("dnfdCategoria",aux[1]);
	}

	docN.save(true, false);	
}