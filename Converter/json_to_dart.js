const vscode = require("vscode")
module.exports = function generateClass(classInfo) {
  return `${classInfo.class.map((myClass)=>{
    return `class ${myClass.className} {
${myClass.parameters.map((parameter) => {
return `${myClass.mutable ? "":"final"} ${parameter.dataType} ${parameter.name};`
}).join("\n")
}
${myClass.mutable ? "":"const"} ${myClass.className}({${myClass.parameters.map((parameter) => `${parameter.required ? 'required ' : ''}this.${parameter.name} ${parameter.isDefault ? `= ${parameter.defaultValue}` :''}`).join(", ")}});
${myClass.className} copyWith({${myClass.parameters.map((parameter)=>`${parameter.dataType.endsWith("?") ? parameter.dataType: parameter.dataType+"?"} ${parameter.name}` ).join(", ")}}){
return ${myClass.className}(
            ${
                myClass.parameters.map((parameter)=>`${parameter.name}:${parameter.name} ?? this.${parameter.name}`).join(",\n")
            }
        );
        }
        
Map<String,Object?> toJson(){
    return {
            ${
            myClass.parameters.map((parameter)=>`'${parameter.name}': ${parameter.inbuilt ?  parameter.name : toJsonForClass(parameter)}`).join(",\n")
            }
    };
}

static ${myClass.className} fromJson(Map<String , Object?> json){
    return ${myClass.className}(
            ${myClass.parameters.map((parameter)=>`${parameter.name}:${parameter.inbuilt ? isOptionalDataType(parameter.dataType) ? parameter.isDefault ? defaultValueParameter(parameter) : nullDataType(parameter) : parameter.isDefault ? defaultValueParameter(parameter) : notOptionalDataType(parameter) : `${fromJsonForClass(parameter)}` }`).join(",\n")}
    );
}

@override
String toString(){
    return '''${myClass.className}(
                ${myClass.parameters.map((parameter)=>`${parameter.name}:${parameter.inbuilt ? `$${parameter.name}` : `\${${parameter.name}.toString()\}` }`).join(",\n")}
    ) ''';
}

@override
bool operator ==(Object other){
    return other is ${myClass.className} && 
        other.runtimeType == runtimeType &&
        ${myClass.parameters.map((parameter)=>`other.${parameter.name} == ${parameter.name}`).join(" && \n")};
}
      
@override
int get hashCode {
    return Object.hash(
                runtimeType,
                ${myClass.parameters.map((parameter)=>parameter.name).join(", \n")}
    );
}
    
}
      
      `
    }).join("\n")
    }
  
     `
}



function removeQuestion(str){
    if(str.endsWith("?")){
        return str.substring(0,str.length-1)
    }
    return str;
}
  
function toJsonForClass(parameter) {
   if(parameter.dataType.startsWith("List")){
      return `${parameter.name}?.map<Map<String,dynamic>>((data)=> data.toJson()).toList()` 
   }else if(parameter.dataType.startsWith("Map")){
    return `${parameter.name}['${parameter.name}']?.toJson()`
   }
   return `${parameter.name}?.toJson()`
}
function fromJsonForClass(parameter) {
   if(parameter.dataType.startsWith("List")){
      return isOptionalDataType(parameter.dataType)? parameter.isDefault ? defaultValueParameterForClassDataTypeList(parameter):  `json['${parameter.name}'] == null ? null : (json['${parameter.name}'] as List).map<${parameter.className}>((data)=> ${parameter.className}.fromJson(data  as Map<String,Object?>)).toList()`  :parameter.isDefault ? defaultValueParameterForClassDataTypeList(parameter) : `(json['${parameter.name}'] as List).map<${parameter.className}>((data)=> ${parameter.className}.fromJson(data as Map<String,Object?>)).toList()` 
   }
   return isOptionalDataType(parameter.dataType)?parameter.isDefault ? defaultValueParameterForClassDataTypeDynamic(parameter) : `json['${parameter.name}'] == null ? null : ${parameter.className}.fromJson(json['${parameter.name}']  as Map<String,Object?>)` :parameter.isDefault ? defaultValueParameterForClassDataTypeDynamic(parameter) :`${parameter.className}.fromJson(json['${parameter.name}']  as Map<String,Object?>)`
}
function defaultValueParameter(parameter){
    return  `json['${parameter.name}'] == null ? ${parameter.defaultValue} : json['${parameter.name}'] as ${removeQuestion(parameter.dataType)}`
}
function defaultValueParameterForClassDataTypeList(parameter){
    return  `json['${parameter.name}'] == null ? ${parameter.defaultValue} : json['${parameter.name}'].map<${parameter.className}>((data)=> (${parameter.className} as List).fromJson(data  as Map<String,Object?>)).toList()`
}
function defaultValueParameterForClassDataTypeMap(parameter){
    return   `${parameter.name}['${parameter.name}'] == null ? ${parameter.defaultValue} : ${parameter.name}['${parameter.name}']`
}
function defaultValueParameterForClassDataTypeDynamic(parameter){
    return   `json['${parameter.name}'] == null ? ${parameter.defaultValue} : ${parameter.className}.fromJson(json['${parameter.name}'])`
}
function notOptionalDataType(parameter){
    return `json['${parameter.name}'] as ${removeQuestion(parameter.dataType)}`
}
function nullDataType(parameter){
    return `json['${parameter.name}'] == null ? null : json['${parameter.name}'] as ${removeQuestion(parameter.dataType)}`
}

function isOptionalDataType(dataType) {
    return dataType.endsWith("?")
}
