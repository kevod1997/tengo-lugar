import type { DocumentResponse } from "@/services/registration/admin/user-service"
import { ExpandableImage } from "../ExpandableImage"
import { ValidationControls } from "./ValidationControls"
import { formatDatetoLocaleDateString } from "@/utils/format/formatDate"


interface LicenseTabProps {
  licence: DocumentResponse["licence"]
  onValidate: (validationRequest: any) => Promise<void>
}

export function LicenseTab({ licence, onValidate }: LicenseTabProps) {
  if (!licence) {
    return <p>No hay información de licencia de conducir disponible.</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Fecha de expiración</h3>
          <p>{formatDatetoLocaleDateString(licence.expiration)}</p>
        </div>
        <div>
          <h3 className="font-semibold">Estado</h3>
          <p>{licence.status}</p>
        </div>
        <div>
          <h3 className="font-semibold">Verificado en</h3>
          <p>{formatDatetoLocaleDateString(licence.verifiedAt)}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Frente de la licencia</h3>
          {
            licence.urls.front && <ExpandableImage src={licence.urls.front} alt="Frente de la licencia" />
          }
          {/* <ExpandableImage src={licence.urls.front} alt="Frente de la licencia" /> */}
        </div>
        <div>
          <h3 className="font-semibold">Reverso de la licencia</h3>{
            licence.urls.back && <ExpandableImage src={licence.urls.back} alt="Reverso de la licencia" />
          }
          {/* <ExpandableImage src={licence.urls.back} alt="Reverso de la licencia" /> */}
        </div>
      </div>
      <ValidationControls
        documentType="LICENCE"
        documentId={licence.id}
        currentStatus={licence.status}
        onValidate={onValidate}
      />
    </div>
  )
}

