import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface ValidationControlsProps {
  documentType: "IDENTITY" | "LICENCE" | "INSURANCE"
  documentId: string
  currentStatus: string
  onValidate: (validationRequest: any) => Promise<void>
}

export function ValidationControls({ documentType, documentId, currentStatus, onValidate }: ValidationControlsProps) {
  const [validating, setValidating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<"VERIFIED" | "FAILED">("VERIFIED")
  const [failureReason, setFailureReason] = useState("")
  const [frontFailed, setFrontFailed] = useState(false)
  const [backFailed, setBackFailed] = useState(false)

  const isDualSidedDocument = documentType === "IDENTITY" || documentType === "LICENCE"

  const handleValidation = async () => {
    try {
      setValidating(true)

      const validationRequest = {
        documentId,
        documentType,
        status: selectedStatus,
        ...(selectedStatus === "FAILED" && {
          failureReason,
          ...(isDualSidedDocument && {
            failedImages: {
              front: frontFailed,
              back: backFailed,
            },
          }),
        }),
      }

      await onValidate(validationRequest)
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="space-y-4 mt-6 p-4 border rounded-lg">
      <h3 className="font-semibold">Validación del documento</h3>
      <div className="space-y-4">
        <Select value={selectedStatus} onValueChange={(value: "VERIFIED" | "FAILED") => setSelectedStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VERIFIED">Verificado</SelectItem>
            <SelectItem value="FAILED">Rechazado</SelectItem>
          </SelectContent>
        </Select>

        {selectedStatus === "FAILED" && (
          <>
            {isDualSidedDocument && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="front"
                    checked={frontFailed}
                    onCheckedChange={(checked) => setFrontFailed(checked as boolean)}
                  />
                  <label htmlFor="front">Frente del documento ilegible</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="back"
                    checked={backFailed}
                    onCheckedChange={(checked) => setBackFailed(checked as boolean)}
                  />
                  <label htmlFor="back">Reverso del documento ilegible</label>
                </div>
              </div>
            )}

            <Textarea
              placeholder="Razón del rechazo"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="min-h-[100px]"
            />
          </>
        )}

        <Button
          onClick={handleValidation}
          disabled={validating || (selectedStatus === "FAILED" && !failureReason) || selectedStatus === currentStatus || currentStatus === "VERIFIED" || currentStatus === "FAILED"}
          className="w-full"
        >
          {validating ? "Validando..." : "Validar documento"}
        </Button>
      </div>
    </div>
  )
}

