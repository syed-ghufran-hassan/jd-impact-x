;; Impact-X Campaign Registry V2
;; Cross-chain crowdfunding platform with USDCx escrow
;; Features: Trustless deposits, automatic refunds, milestone tracking
;; 
;; This contract manages fundraising campaigns on Stacks blockchain with the following features:
;; - Campaign creation with customizable goals and deadlines
;; - USDCx token escrow for secure donation holding
;; - 5% platform fee on successful campaigns
;; - Automatic refund mechanism for failed campaigns
;; - Emergency pause functionality for security
;; - Comprehensive status tracking and analytics
;;
;; Architecture:
;; - Uses SIP-010 trait for USDCx token interactions
;; - Escrow pattern: all donations held in contract until claimed or refunded
;; - Immutable campaign records with updatable metadata
;; - Event logging for all major state changes
;;
;; Security Considerations:
;; - Only campaign owners can claim funds when goal is met
;; - Refunds only available after deadline if goal not met
;; - Contract owner can pause in emergencies
;; - No reentrancy vulnerabilities (Clarity safety)
;; - No integer overflow (Clarity safety with uint)

;; ============================================
;; Extended Campaign Registry - Impact-X V2
;; ============================================

;; Campaigns with extended metadata
(define-map campaigns
  { id: uint }
  {
    owner: principal,
    ipfs-hash: (string-ascii 64),
    description: (string-utf8 256),
    category: (string-ascii 32),
    goal: uint,
    raised: uint,
    deadline: uint,
    claimed: bool,
    created-at: uint,
    refund-enabled: bool
  }
)

;; Donations per user with optional reward note
(define-map donations
  { campaign-id: uint, donor: principal }
  { 
    amount: uint,
    refunded: bool,
    reward-note: (optional (string-utf8 100))
  }
)

;; Campaign backers
(define-map campaign-backers
  { campaign-id: uint }
  { count: uint }
)

;; Refund stats
(define-map refund-tracker
  { campaign-id: uint }
  { total-refunded: uint, refund-count: uint }
)

;; Analytics: total raised per category
(define-map category-analytics
  { category: (string-ascii 32) }
  { total-raised: uint }
)

;; Campaign updates/events
(define-map campaign-updates
  { campaign-id: uint }
  { updates: (list 20 (string-utf8 200)) }
)

;; ============================================
;; Public Function: Create Campaign (Extended)
;; ============================================

(define-public (create-campaign 
    (ipfs-hash (string-ascii 64)) 
    (description (string-utf8 256))
    (category (string-ascii 32))
    (goal uint) 
    (duration-blocks uint))
  (begin
    (asserts! (> goal u0) ERR_INVALID_AMOUNT)
    (asserts! (> duration-blocks u0) ERR_INVALID_AMOUNT)
    (check-not-paused)
    (let ((new-id (+ (var-get campaign-counter) u1))
          (deadline (+ stacks-block-height duration-blocks)))
      ;; Store campaign
      (map-set campaigns { id: new-id }
        {
          owner: tx-sender,
          ipfs-hash: ipfs-hash,
          description: description,
          category: category,
          goal: goal,
          raised: u0,
          deadline: deadline,
          claimed: false,
          created-at: stacks-block-height,
          refund-enabled: true
        })
      
      ;; Backer and refund init
      (map-set campaign-backers { campaign-id: new-id } { count: u0 })
      (map-set refund-tracker { campaign-id: new-id } { total-refunded: u0, refund-count: u0 })
      
      ;; Initialize category analytics if not exists
      (let ((current-total (default-to u0 (map-get? category-analytics { category: category }))))
        (map-set category-analytics { category: category } { total-raised: current-total }))
      
      (var-set campaign-counter new-id)
      
      (print { event: "campaign-created", id: new-id, owner: tx-sender, category: category, goal: goal })
      (ok new-id)
    )
  )
)

;; ============================================
;; Public Function: Post Campaign Update
;; ============================================

(define-public (post-campaign-update (campaign-id uint) (update-text (string-utf8 200)))
  (let ((campaign (unwrap! (map-get? campaigns { id: campaign-id }) ERR_CAMPAIGN_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get owner campaign)) ERR_NOT_OWNER)
    (let ((current-updates (default-to (list) (map-get? campaign-updates { campaign-id: campaign-id }))))
      (map-set campaign-updates { campaign-id: campaign-id } 
        (merge { updates: current-updates } { updates: (unwrap! (as-max-len? (append current-updates update-text) u20) ERR_INVALID_AMOUNT) })))
    (print { event: "campaign-update-posted", campaign-id: campaign-id, text: update-text })
    (ok true)
  )
)

;; ============================================
;; Public Function: Donate with Reward Note
;; ============================================

(define-public (donate (campaign-id uint) (amount uint) (token <sip-010-trait>) (reward-note (optional (string-utf8 100))))
  (begin
    (check-not-paused)
    (let ((campaign (unwrap! (map-get? campaigns { id: campaign-id }) ERR_CAMPAIGN_NOT_FOUND))
          (current-donation (get amount (get-donation campaign-id tx-sender)))
          (current-backers (get count (get-backer-count campaign-id))))
      (asserts! (<= stacks-block-height (get deadline campaign)) ERR_CAMPAIGN_EXPIRED)
      (asserts! (not (get claimed campaign)) ERR_ALREADY_CLAIMED)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      
      ;; Transfer token
      (try! (contract-call? token transfer amount tx-sender (as-contract tx-sender) none))
      
      ;; Update raised
      (map-set campaigns { id: campaign-id } (merge campaign { raised: (+ (get raised campaign) amount) }))
      
      ;; Update donor
      (map-set donations { campaign-id: campaign-id, donor: tx-sender } { amount: (+ current-donation amount), refunded: false, reward-note: reward-note })
      
      ;; Increment backers if new
      (if (is-eq current-donation u0)
        (map-set campaign-backers { campaign-id: campaign-id } { count: (+ current-backers u1) })
        true
      )
      
      ;; Update category analytics
      (let ((cat (get category campaign))
            (total (default-to u0 (map-get? category-analytics { category: (get category campaign) }))))
        (map-set category-analytics { category: cat } { total-raised: (+ total amount) }))
      
      ;; Update total donations
      (var-set total-donations (+ (var-get total-donations) amount))
      
      (print { event: "donation-received", campaign-id: campaign-id, donor: tx-sender, amount: amount })
      (ok true)
    )
  )
)
