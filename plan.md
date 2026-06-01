# Project Workspace Implementation Plan (On Hold)

This plan outlines the architecture for the "Project Workspace" and "Team Collaboration" features. When ready to implement, refer to this document.

## 1. Architectural Changes

### Gig Model Update (`backend/modules/shared/models/Gig.js`)
To support team collaboration, the `Gig` model needs to replace the single `hiredInternId` reference with an array.
```javascript
// Replace hiredInternId with:
teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}]
```
- **Service Updates:** 
  - `applicationService.js`: Update the hire logic to `gig.teamMembers.push(application.internId)`.
  - `gigService.js`: Update the stipend release logic to divide `gig.escrowAmount` among all `teamMembers` instead of giving it to a single intern.
- **Socket Updates:** 
  - `server.js`: Change chat room authorization from `gig.hiredInternId === socket.userId` to `gig.teamMembers.includes(socket.userId)`.

### New Model (`backend/modules/shared/models/Deliverable.js`)
A new model to track individual pieces of work uploaded by team members.
- `gigId`: Reference to Gig
- `submittedBy`: Reference to User (the intern)
- `title`: String
- `description`: String
- `fileUrl`: String (URL of uploaded file)
- `status`: Enum `['pending_review', 'approved', 'rejected']`
- `feedback`: String (optional feedback from hirer)

## 2. Backend APIs

Create `backend/modules/shared/routes/workspaceRoutes.js` and mount it at `/api/v1/workspace` in `server.js`.
It will have the following endpoints (in `workspaceController.js`):
1. `GET /api/v1/workspace/:gigId` - Fetches the gig, the team members, and the deliverables history.
2. `POST /api/v1/workspace/:gigId/deliverables` - Uploads a file (using Cloudinary/local fallback) and creates a Deliverable document.
3. `PATCH /api/v1/workspace/deliverables/:id/review` - Hirer approves/rejects a deliverable.
4. `POST /api/v1/workspace/:gigId/team` - Add another intern to the project via their email.

## 3. Frontend UI

Create a unified page at `frontend/src/modules/shared/pages/Workspace.jsx`.
- **Header:** Displays the Gig title and current status.
- **Collaboration Team:** Shows avatars of the Hirer and Team Members. Includes an "Add Intern" form.
- **Deliverables Panel:** 
  - Interns see an upload form to submit new deliverables.
  - Hirers see a history of submissions with buttons to "Approve" or "Reject".
- **Chat Integration:** Embed the existing `<Chat gigId={gigId} />` component to serve as a project-specific team chat room.

## 4. Navigation Updates

In `frontend/src/modules/shared/pages/Dashboard.jsx`:
- Update the Gig list items so that clicking on a gig with status `assigned`, `in-progress`, `completed`, or `closed` navigates to `/workspace/:gigId` instead of `/gigs/:gigId`.
- Ensure `frontend/src/App.jsx` mounts the `<Workspace />` component wrapped in a `<PrivateRoute>`.
