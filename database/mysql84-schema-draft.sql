-- Tu Tien Gia Toc / Demo A — MySQL 8.4 design draft.
-- Source: docs/scope-baseline-demo-a-v1.0.md. Not a deployed migration.
-- Numeric thresholds, coordinates, content identifiers and exact tick rules
-- are technical parameters. Publish all rows of a snapshot in one transaction.

CREATE TABLE game_run (
    run_id BINARY(16) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (run_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE save_slot (
    slot_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    run_id BINARY(16) NOT NULL,
    slot_no SMALLINT UNSIGNED NOT NULL,
    active_snapshot_id BIGINT UNSIGNED NULL,
    PRIMARY KEY (slot_id),
    UNIQUE KEY uq_run_slot (run_id, slot_no),
    CONSTRAINT fk_slot_run FOREIGN KEY (run_id) REFERENCES game_run (run_id),
    CONSTRAINT ck_slot_no CHECK (slot_no >= 1)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE save_snapshot (
    snapshot_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slot_id BIGINT UNSIGNED NOT NULL,
    revision BIGINT UNSIGNED NOT NULL,
    schema_version INT UNSIGNED NOT NULL,
    content_version VARCHAR(32) NOT NULL,
    game_tick BIGINT UNSIGNED NOT NULL,
    captured_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (snapshot_id),
    UNIQUE KEY uq_snapshot_slot_revision (slot_id, revision),
    UNIQUE KEY uq_snapshot_slot_id (slot_id, snapshot_id),
    CONSTRAINT fk_snapshot_slot FOREIGN KEY (slot_id) REFERENCES save_slot (slot_id),
    CONSTRAINT ck_snapshot_revision CHECK (revision >= 1),
    CONSTRAINT ck_snapshot_schema_version CHECK (schema_version >= 1),
    CONSTRAINT ck_snapshot_content_version CHECK (CHAR_LENGTH(content_version) > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- The active pointer cannot refer to another slot's snapshot.
ALTER TABLE save_slot
    ADD CONSTRAINT fk_slot_active_snapshot
    FOREIGN KEY (slot_id, active_snapshot_id)
    REFERENCES save_snapshot (slot_id, snapshot_id);

-- Approved four jobs. Slot values are stable across saves.
CREATE TABLE job_definition (
    job_slot TINYINT UNSIGNED NOT NULL,
    job_code VARCHAR(32) NOT NULL,
    PRIMARY KEY (job_slot),
    UNIQUE KEY uq_job_code (job_code),
    CONSTRAINT ck_job_slot CHECK (job_slot BETWEEN 1 AND 4)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO job_definition (job_slot, job_code) VALUES
    (1, 'GATHER'), (2, 'CULTIVATE'), (3, 'GUARD'), (4, 'HUNT');

-- Four hand-authored NPC identities. content_ref points to reviewed static
-- personality/dialogue/recruitment data; exact identifiers are not yet chosen.
CREATE TABLE npc_definition (
    npc_slot TINYINT UNSIGNED NOT NULL,
    npc_code VARCHAR(64) NULL,
    content_ref VARCHAR(128) NULL,
    PRIMARY KEY (npc_slot),
    UNIQUE KEY uq_npc_code (npc_code),
    CONSTRAINT ck_definition_npc_slot CHECK (npc_slot BETWEEN 1 AND 4)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO npc_definition (npc_slot, npc_code, content_ref) VALUES
    (1, NULL, NULL), (2, NULL, NULL), (3, NULL, NULL), (4, NULL, NULL);

CREATE TABLE snapshot_player (
    snapshot_id BIGINT UNSIGNED NOT NULL,
    hp INT UNSIGNED NOT NULL,
    max_hp INT UNSIGNED NOT NULL,
    stamina INT UNSIGNED NOT NULL,
    max_stamina INT UNSIGNED NOT NULL,
    cultivation_progress BIGINT UNSIGNED NOT NULL,
    breakthrough_count TINYINT UNSIGNED NOT NULL,
    attack_ready_tick BIGINT UNSIGNED NOT NULL,
    location_kind VARCHAR(16) NOT NULL,
    location_ref VARCHAR(128) NOT NULL,
    pos_x DECIMAL(12, 3) NULL,
    pos_y DECIMAL(12, 3) NULL,
    combat_target_ref VARCHAR(128) NULL,
    PRIMARY KEY (snapshot_id),
    CONSTRAINT fk_player_snapshot FOREIGN KEY (snapshot_id)
        REFERENCES save_snapshot (snapshot_id),
    CONSTRAINT ck_player_hp CHECK (max_hp > 0 AND hp BETWEEN 1 AND max_hp),
    CONSTRAINT ck_player_stamina CHECK (max_stamina > 0 AND stamina <= max_stamina),
    CONSTRAINT ck_player_breakthrough CHECK (breakthrough_count IN (0, 1)),
    CONSTRAINT ck_player_location CHECK (
        (location_kind = 'WORLD' AND pos_x IS NOT NULL AND pos_y IS NOT NULL)
        OR location_kind = 'VILLA_INTERIOR'
    )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE snapshot_villa (
    snapshot_id BIGINT UNSIGNED NOT NULL,
    villa_built BOOLEAN NOT NULL,
    interior_ref VARCHAR(128) NULL,
    location_ref VARCHAR(128) NULL,
    pos_x DECIMAL(12, 3) NULL,
    pos_y DECIMAL(12, 3) NULL,
    PRIMARY KEY (snapshot_id),
    CONSTRAINT fk_villa_snapshot FOREIGN KEY (snapshot_id)
        REFERENCES save_snapshot (snapshot_id),
    CONSTRAINT ck_villa_built CHECK (villa_built IN (0, 1)),
    CONSTRAINT ck_villa_interior CHECK (
        (villa_built = 0 AND interior_ref IS NULL
            AND location_ref IS NULL AND pos_x IS NULL AND pos_y IS NULL)
        OR (villa_built = 1 AND interior_ref IS NOT NULL
            AND location_ref IS NOT NULL AND pos_x IS NOT NULL AND pos_y IS NOT NULL)
    )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Exactly four rows, including NPCs not yet recruited, are required by the
-- Save/Load service. MySQL cannot enforce that row count with a row CHECK.
CREATE TABLE snapshot_npc (
    snapshot_id BIGINT UNSIGNED NOT NULL,
    npc_slot TINYINT UNSIGNED NOT NULL,
    life_state VARCHAR(20) NOT NULL,
    activity_state VARCHAR(32) NULL,
    revivals_used TINYINT UNSIGNED NOT NULL,
    hp INT UNSIGNED NOT NULL,
    max_hp INT UNSIGNED NOT NULL,
    stamina INT UNSIGNED NOT NULL,
    max_stamina INT UNSIGNED NOT NULL,
    cultivation_progress BIGINT UNSIGNED NOT NULL,
    job_slot TINYINT UNSIGNED NULL,
    job_area_ref VARCHAR(128) NULL,
    rest_until_tick BIGINT UNSIGNED NULL,
    attack_ready_tick BIGINT UNSIGNED NULL,
    location_kind VARCHAR(16) NOT NULL,
    location_ref VARCHAR(128) NOT NULL,
    pos_x DECIMAL(12, 3) NULL,
    pos_y DECIMAL(12, 3) NULL,
    combat_target_ref VARCHAR(128) NULL,
    PRIMARY KEY (snapshot_id, npc_slot),
    KEY ix_npc_definition (npc_slot),
    KEY ix_npc_job_slot (job_slot),
    CONSTRAINT fk_npc_snapshot FOREIGN KEY (snapshot_id)
        REFERENCES save_snapshot (snapshot_id),
    CONSTRAINT fk_npc_definition FOREIGN KEY (npc_slot)
        REFERENCES npc_definition (npc_slot),
    CONSTRAINT fk_npc_job FOREIGN KEY (job_slot)
        REFERENCES job_definition (job_slot),
    CONSTRAINT ck_npc_slot CHECK (npc_slot BETWEEN 1 AND 4),
    CONSTRAINT ck_npc_revives CHECK (revivals_used IN (0, 1)),
    CONSTRAINT ck_npc_vitals CHECK (
        max_hp > 0 AND hp <= max_hp
        AND max_stamina > 0 AND stamina <= max_stamina
    ),
    CONSTRAINT ck_npc_life CHECK (
        (life_state = 'UNRECRUITED' AND hp > 0 AND revivals_used = 0
            AND job_slot IS NULL AND job_area_ref IS NULL
            AND activity_state IS NOT NULL
            AND activity_state = 'SAFE_WANDER')
        OR (life_state = 'ALIVE' AND hp > 0 AND activity_state IS NOT NULL
            AND activity_state IN
            ('IDLE', 'WORKING', 'RESTING', 'RETREATING', 'RECOVERING', 'WAITING'))
        OR (life_state = 'DEAD_WAITING' AND hp = 0 AND revivals_used = 0
            AND activity_state IS NULL)
        OR (life_state = 'DEAD_PERMANENT' AND hp = 0 AND revivals_used = 1
            AND job_slot IS NULL AND job_area_ref IS NULL
            AND activity_state IS NULL)
    ),
    CONSTRAINT ck_npc_rest_timer CHECK (
        activity_state NOT IN ('RESTING', 'WAITING') OR rest_until_tick IS NOT NULL
    ),
    CONSTRAINT ck_npc_guard_area CHECK (
        job_slot IS NULL OR job_slot <> 3 OR job_area_ref IS NOT NULL
    ),
    CONSTRAINT ck_npc_location CHECK (
        (location_kind = 'WORLD' AND pos_x IS NOT NULL AND pos_y IS NOT NULL)
        OR location_kind = 'VILLA_INTERIOR'
    )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Shared run resource stock; baseline does not specify personal NPC inventories.
-- resource_code values come from approved content.
CREATE TABLE snapshot_resource_stock (
    snapshot_id BIGINT UNSIGNED NOT NULL,
    resource_code VARCHAR(64) NOT NULL,
    quantity BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (snapshot_id, resource_code),
    CONSTRAINT fk_resource_stock_snapshot FOREIGN KEY (snapshot_id)
        REFERENCES save_snapshot (snapshot_id),
    CONSTRAINT ck_resource_stock_code CHECK (CHAR_LENGTH(resource_code) > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Dynamic resource nodes must be saved so loading cannot duplicate resources.
CREATE TABLE snapshot_resource_node (
    snapshot_id BIGINT UNSIGNED NOT NULL,
    node_ref VARCHAR(128) NOT NULL,
    resource_code VARCHAR(64) NOT NULL,
    remaining_quantity BIGINT UNSIGNED NOT NULL,
    location_ref VARCHAR(128) NOT NULL,
    pos_x DECIMAL(12, 3) NOT NULL,
    pos_y DECIMAL(12, 3) NOT NULL,
    PRIMARY KEY (snapshot_id, node_ref),
    CONSTRAINT fk_resource_node_snapshot FOREIGN KEY (snapshot_id)
        REFERENCES save_snapshot (snapshot_id),
    CONSTRAINT ck_resource_node_code CHECK (CHAR_LENGTH(resource_code) > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Runtime monster state needed when saving during combat/retreat.
-- Static spawn position and chase radius live in versioned game content.
CREATE TABLE snapshot_monster (
    snapshot_id BIGINT UNSIGNED NOT NULL,
    monster_ref VARCHAR(128) NOT NULL,
    life_state VARCHAR(8) NOT NULL,
    ai_state VARCHAR(8) NULL,
    hp INT UNSIGNED NOT NULL,
    max_hp INT UNSIGNED NOT NULL,
    attack_ready_tick BIGINT UNSIGNED NULL,
    target_ref VARCHAR(128) NULL,
    location_ref VARCHAR(128) NOT NULL,
    pos_x DECIMAL(12, 3) NOT NULL,
    pos_y DECIMAL(12, 3) NOT NULL,
    PRIMARY KEY (snapshot_id, monster_ref),
    CONSTRAINT fk_monster_snapshot FOREIGN KEY (snapshot_id)
        REFERENCES save_snapshot (snapshot_id),
    CONSTRAINT ck_monster_life CHECK (
        (life_state = 'ALIVE' AND hp BETWEEN 1 AND max_hp
            AND ai_state IS NOT NULL
            AND ai_state IN ('IDLE', 'CHASE', 'RETURN'))
        OR (life_state = 'DEAD' AND hp = 0 AND ai_state IS NULL)
    ),
    CONSTRAINT ck_monster_max_hp CHECK (max_hp > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Cross-table checks remain in the Save/Load service before publishing:
-- * exactly one player, one villa, and four fixed NPC rows per snapshot;
-- * UNRECRUITED NPC stays in the safe region and never dies;
-- * DEAD_WAITING requires an unbuilt villa; VILLA_INTERIOR requires a built villa;
-- * four alive NPCs + villa + breakthrough_count = 1 means COMPLETED;
-- * any DEAD_PERMANENT NPC makes four-alive completion impossible;
-- * all world facts needed for AC-01..AC-13 share this snapshot/content version.
