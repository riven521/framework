﻿SET 
  ANSI_NULLS, 
  QUOTED_IDENTIFIER, 
  CONCAT_NULL_YIELDS_NULL, 
  ANSI_WARNINGS, 
  ANSI_PADDING 
ON;

USE OraQ;
IF OBJECT_ID('goNonDicomFileData') IS NOT NULL
	DROP PROCEDURE goNonDicomFile;
GO

CREATE PROCEDURE goNonDicomFileData
	@uid INT
AS
	SELECT CAST(data AS IMAGE) data
	FROM Inspect.nonDicomFile
	WHERE uid = @uid;
GO