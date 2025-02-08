import type { DocumentResponse } from "@/services/registration/admin/user-service"
import { ExpandableImage } from "../ExpandableImage"
import { formatDatetoLocaleDateString } from "@/utils/format/formatDate"
import { ValidationControls } from "./ValidationControls"


interface IdentityTabProps {
  identityCard: DocumentResponse["identityCard"]
  onValidate: (validationRequest: any) => Promise<void>
}

export function IdentityTab({ identityCard, onValidate }: IdentityTabProps) {
  if (!identityCard) {
    return <p>No hay información de documento de identidad disponible.</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Número de ID</h3>
          <p>{identityCard.idNumber}</p>
        </div>
        <div>
          <h3 className="font-semibold">Estado</h3>
          <p>{identityCard.status}</p>
        </div>
        <div>
          <h3 className="font-semibold">Verificado en</h3>
          <p>{formatDatetoLocaleDateString(identityCard.verifiedAt)}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Frente del documento</h3>
          {
            identityCard.urls && (
              <ExpandableImage src={identityCard.urls.front} alt="Frente del documento" />
            )
          }
        </div>
        <div>
          <h3 className="font-semibold">Reverso del documento</h3>
          {
            identityCard.urls && (
              <ExpandableImage src={identityCard.urls.back} alt="Reverso del documento" />
            )
          }
        </div>
      </div>
      <ValidationControls
        documentType="IDENTITY"
        documentId={identityCard.id}
        currentStatus={identityCard.status}
        onValidate={onValidate}
      />
    </div>
  )
}

